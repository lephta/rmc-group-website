<script setup>
import {
  computed,
  onMounted,
  ref
} from "vue";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import {
  deleteObject,
  ref as storageRef
} from "firebase/storage";

import {
  db,
  storage
} from "../../firebase";

const applications = ref([]);
const selectedApplication = ref(null);

const searchTerm = ref("");
const statusFilter = ref("all");

const isLoading = ref(true);
const isUpdating = ref(false);

const message = ref("");
const messageType = ref("");

const applicationStatuses = [
  "new",
  "reviewed",
  "shortlisted",
  "interview",
  "hired",
  "rejected"
];

/* =========================
   FILTER APPLICATIONS
========================= */

const filteredApplications = computed(() => {
  const search = searchTerm.value
    .trim()
    .toLowerCase();

  return applications.value.filter(
    (application) => {
      const matchesStatus =
        statusFilter.value === "all" ||
        application.status ===
          statusFilter.value;

      const searchableValues = [
        application.fullName,
        application.firstName,
        application.lastName,
        application.email,
        application.phone,
        application.vacancyTitle,
        application.position,
        application.status
      ];

      const matchesSearch =
        !search ||
        searchableValues.some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(search)
        );

      return matchesStatus && matchesSearch;
    }
  );
});

/* =========================
   HELPERS
========================= */

const showFeedback = (
  text,
  type = "success"
) => {
  message.value = text;
  messageType.value = type;

  window.setTimeout(() => {
    message.value = "";
  }, 4000);
};

const getDateValue = (value) => {
  if (!value) {
    return null;
  }

  const date =
    typeof value.toDate === "function"
      ? value.toDate()
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const formatDate = (value) => {
  const date = getDateValue(value);

  if (!date) {
    return "No date";
  }

  return new Intl.DateTimeFormat(
    "en-ZA",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(date);
};

const getApplicantName = (application) => {
  if (application.fullName) {
    return application.fullName;
  }

  const name = [
    application.firstName,
    application.lastName
  ]
    .filter(Boolean)
    .join(" ");

  return name || "Unnamed applicant";
};

const getVacancyTitle = (application) => {
  return (
    application.vacancyTitle ||
    application.position ||
    application.jobTitle ||
    "Not specified"
  );
};

const formatStatus = (status) => {
  const labels = {
    new: "New",
    reviewed: "Reviewed",
    shortlisted: "Shortlisted",
    interview: "Interview Scheduled",
    hired: "Hired",
    rejected: "Rejected"
  };

  return labels[status] || "New";
};

/* =========================
   LOAD APPLICATIONS
========================= */

const loadApplications = async () => {
  isLoading.value = true;

  try {
    const applicationsQuery = query(
      collection(db, "applications"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(
      applicationsQuery
    );

    applications.value = snapshot.docs.map(
      (applicationDoc) => ({
        id: applicationDoc.id,
        status: "new",
        ...applicationDoc.data()
      })
    );
  } catch (error) {
    console.error(
      "Load applications error:",
      error
    );

    showFeedback(
      "Applications could not be loaded.",
      "error"
    );
  } finally {
    isLoading.value = false;
  }
};

/* =========================
   VIEW APPLICATION
========================= */

const openApplication = async (application) => {
  if (application?.id && application.viewedByAdmin !== true) {
    try {
      await updateDoc(doc(db, "applications", application.id), {
        viewedByAdmin: true,
        viewedAt: serverTimestamp()
      });

      application.viewedByAdmin = true;
    } catch (error) {
      console.error("Unable to mark item as viewed:", error);
    }
  }

  selectedApplication.value = application;

  document.body.style.overflow = "hidden";
};

const closeApplication = () => {
  selectedApplication.value = null;

  document.body.style.overflow = "";
};

/* =========================
   UPDATE STATUS
========================= */

const updateApplicationStatus = async (
  application,
  newStatus
) => {
  if (
    !application?.id ||
    !newStatus ||
    isUpdating.value
  ) {
    return;
  }

  isUpdating.value = true;

  try {
    await updateDoc(
      doc(
        db,
        "applications",
        application.id
      ),
      {
        status: newStatus,
        updatedAt: serverTimestamp()
      }
    );

    application.status = newStatus;

    const matchingApplication =
      applications.value.find(
        (item) =>
          item.id === application.id
      );

    if (matchingApplication) {
      matchingApplication.status =
        newStatus;
    }

    showFeedback(
      `Application marked as ${formatStatus(
        newStatus
      )}.`
    );
  } catch (error) {
    console.error(
      "Application status error:",
      error
    );

    showFeedback(
      "Application status could not be updated.",
      "error"
    );
  } finally {
    isUpdating.value = false;
  }
};

/* =========================
   DELETE APPLICATION
========================= */

const removeApplication = async (
  application
) => {
  const applicantName =
    getApplicantName(application);

  const confirmed = window.confirm(
    `Delete the application from "${applicantName}"? This cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  try {
    // Delete the CV from Firebase Storage first.
    if (application.cvUrl) {
      try {
        const cvReference = storageRef(
          storage,
          application.cvUrl
        );

        await deleteObject(cvReference);
      } catch (storageError) {
        if (
          storageError?.code !==
          "storage/object-not-found"
        ) {
          throw storageError;
        }
      }
    }

    // Delete the application document from Firestore.
    await deleteDoc(
      doc(
        db,
        "applications",
        application.id
      )
    );

    applications.value =
      applications.value.filter(
        (item) =>
          item.id !== application.id
      );

    if (
      selectedApplication.value?.id ===
      application.id
    ) {
      closeApplication();
    }

    showFeedback(
      "Application and CV deleted successfully."
    );
  } catch (error) {
    console.error(
      "Delete application error:",
      error
    );

    if (
      error?.code ===
      "storage/unauthorized"
    ) {
      showFeedback(
        "Firebase Storage blocked the CV deletion. Check your Storage rules.",
        "error"
      );
    } else {
      showFeedback(
        "The application could not be deleted.",
        "error"
      );
    }
  }
};

/* =========================
   FILE HELPERS
========================= */

const getCvUrl = (application) => {
  return (
    application.cvUrl ||
    application.resumeUrl ||
    application.fileUrl ||
    application.cvDownloadUrl ||
    ""
  );
};

const openCv = (application) => {
  const cvUrl = getCvUrl(application);

  if (!cvUrl) {
    showFeedback(
      "No CV is available for this application.",
      "error"
    );

    return;
  }

  window.open(
    cvUrl,
    "_blank",
    "noopener,noreferrer"
  );
};

onMounted(loadApplications);
</script>

<template>
  <section class="applications-page">
    <!-- HEADER -->
   <header class="page-header">
  <div>
    <span class="page-label">
      Recruitment Management
    </span>

    <h1>Job applications</h1>

    <p>
      Review and manage submitted recruitment applications.
    </p>
  </div>

  <div class="header-actions">
    <router-link
      to="/admin/dashboard"
      class="secondary-button"
    >
      Back to Dashboard
    </router-link>

    <button
      type="button"
      class="primary-button"
      :disabled="isLoading"
      @click="loadApplications"
    >
      {{ isLoading ? "Loading..." : "Refresh" }}
    </button>
  </div>
</header>

    <!-- FEEDBACK -->
    <div
      v-if="message"
      class="feedback-message"
      :class="messageType"
    >
      {{ message }}
    </div>

    <!-- SUMMARY CARDS -->
    <section class="summary-grid">
      <article class="summary-card">
        <span>Total applications</span>

        <strong>
          {{ applications.length }}
        </strong>
      </article>

      <article class="summary-card">
        <span>New</span>

        <strong>
          {{
            applications.filter(
              item => item.status === "new"
            ).length
          }}
        </strong>
      </article>

      <article class="summary-card">
        <span>Shortlisted</span>

        <strong>
          {{
            applications.filter(
              item =>
                item.status ===
                "shortlisted"
            ).length
          }}
        </strong>
      </article>

      <article class="summary-card">
        <span>Hired</span>

        <strong>
          {{
            applications.filter(
              item => item.status === "hired"
            ).length
          }}
        </strong>
      </article>
    </section>

    <!-- APPLICATIONS LIST -->
    <section class="applications-panel">
      <div class="list-toolbar">
        <div>
          <h2>All applications</h2>

          <p>
            {{ filteredApplications.length }}
            application or applications found
          </p>
        </div>

        <div class="toolbar-controls">
          <select
            v-model="statusFilter"
            class="filter-select"
          >
            <option value="all">
              All statuses
            </option>

            <option
              v-for="status in applicationStatuses"
              :key="status"
              :value="status"
            >
              {{ formatStatus(status) }}
            </option>
          </select>

          <input
            v-model="searchTerm"
            class="search-input"
            type="search"
            placeholder="Search applications..."
          />
        </div>
      </div>

      <div
        v-if="isLoading"
        class="empty-state"
      >
        Loading applications...
      </div>

      <div
        v-else-if="
          filteredApplications.length === 0
        "
        class="empty-state"
      >
        No applications were found.
      </div>

      <div
        v-else
        class="table-wrapper"
      >
        <table class="applications-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Vacancy</th>
              <th>Contact</th>
              <th>Date applied</th>
              <th>Status</th>

              <th class="actions-column">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="application in filteredApplications"
              :key="application.id"
            >
              <td>
                <div class="applicant-cell">
                  <div class="avatar">
                    {{
                      getApplicantName(
                        application
                      )
                        .charAt(0)
                        .toUpperCase()
                    }}
                  </div>

                  <div>
                    <strong>
                      {{
                        getApplicantName(
                          application
                        )
                      }}
                    </strong>

                    <span>
                      {{
                        application.email ||
                        "No email"
                      }}
                    </span>
                  </div>
                </div>
              </td>

              <td>
                {{
                  getVacancyTitle(
                    application
                  )
                }}
              </td>

              <td>
                {{
                  application.phone ||
                  application.phoneNumber ||
                  "No phone"
                }}
              </td>

              <td>
                {{
                  formatDate(
                    application.createdAt
                  )
                }}
              </td>

              <td>
                <select
                  class="status-select"
                  :class="
                    application.status ||
                    'new'
                  "
                  :value="
                    application.status ||
                    'new'
                  "
                  :disabled="isUpdating"
                  @change="
                    updateApplicationStatus(
                      application,
                      $event.target.value
                    )
                  "
                >
                  <option
                    v-for="status in applicationStatuses"
                    :key="status"
                    :value="status"
                  >
                    {{
                      formatStatus(status)
                    }}
                  </option>
                </select>
              </td>

              <td>
                <div class="row-actions">
                  <button
                    class="view-button"
                    type="button"
                    @click="
                      openApplication(
                        application
                      )
                    "
                  >
                    View
                  </button>

                  <button
                    class="delete-button"
                    type="button"
                    @click="
                      removeApplication(
                        application
                      )
                    "
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- APPLICATION DETAILS MODAL -->
    <div
      v-if="selectedApplication"
      class="modal-overlay"
      @click.self="closeApplication"
    >
      <article class="application-modal">
        <header class="modal-header">
          <div>
            <span class="page-label">
              Candidate application
            </span>

            <h2>
              {{
                getApplicantName(
                  selectedApplication
                )
              }}
            </h2>

            <p>
              Applied for
              <strong>
                {{
                  getVacancyTitle(
                    selectedApplication
                  )
                }}
              </strong>
            </p>
          </div>

          <button
            class="modal-close-button"
            type="button"
            aria-label="Close application"
            @click="closeApplication"
          >
            ×
          </button>
        </header>

        <div class="modal-content">
          <section class="details-grid">
            <div class="detail-item">
              <span>Full name</span>

              <strong>
                {{
                  getApplicantName(
                    selectedApplication
                  )
                }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Email address</span>

              <a
                v-if="
                  selectedApplication.email
                "
                :href="
                  `mailto:${selectedApplication.email}`
                "
              >
                {{
                  selectedApplication.email
                }}
              </a>

              <strong v-else>
                Not provided
              </strong>
            </div>

            <div class="detail-item">
              <span>Phone number</span>

              <a
                v-if="
                  selectedApplication.phone ||
                  selectedApplication.phoneNumber
                "
                :href="
                  `tel:${
                    selectedApplication.phone ||
                    selectedApplication.phoneNumber
                  }`
                "
              >
                {{
                  selectedApplication.phone ||
                  selectedApplication.phoneNumber
                }}
              </a>

              <strong v-else>
                Not provided
              </strong>
            </div>

            <div class="detail-item">
              <span>Vacancy</span>

              <strong>
                {{
                  getVacancyTitle(
                    selectedApplication
                  )
                }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Date applied</span>

              <strong>
                {{
                  formatDate(
                    selectedApplication.createdAt
                  )
                }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Status</span>

              <select
                class="status-select"
                :class="
                  selectedApplication.status ||
                  'new'
                "
                :value="
                  selectedApplication.status ||
                  'new'
                "
                :disabled="isUpdating"
                @change="
                  updateApplicationStatus(
                    selectedApplication,
                    $event.target.value
                  )
                "
              >
                <option
                  v-for="status in applicationStatuses"
                  :key="status"
                  :value="status"
                >
                  {{
                    formatStatus(status)
                  }}
                </option>
              </select>
            </div>
          </section>

          <section
            v-if="
              selectedApplication.coverLetter ||
              selectedApplication.message
            "
            class="text-section"
          >
            <h3>Cover letter</h3>

            <p>
              {{
                selectedApplication.coverLetter ||
                selectedApplication.message
              }}
            </p>
          </section>

          <section
            v-if="
              selectedApplication.address
            "
            class="text-section"
          >
            <h3>Address</h3>

            <p>
              {{
                selectedApplication.address
              }}
            </p>
          </section>

          <section
            v-if="
              selectedApplication.experience
            "
            class="text-section"
          >
            <h3>Experience</h3>

            <p>
              {{
                selectedApplication.experience
              }}
            </p>
          </section>

          <div class="modal-actions">
            <button
              class="secondary-button"
              type="button"
              @click="closeApplication"
            >
              Close
            </button>

            <button
              class="cv-button"
              type="button"
              :disabled="
                !getCvUrl(
                  selectedApplication
                )
              "
              @click="
                openCv(
                  selectedApplication
                )
              "
            >
              {{
                getCvUrl(
                  selectedApplication
                )
                  ? "Open CV"
                  : "No CV uploaded"
              }}
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.applications-page {
  min-height: 100vh;
  padding: 42px;
  color: #1e293b;
  background: #f1f5f9;
  font-family: "Segoe UI", Arial, sans-serif;
}

/* HEADER */

.page-header {
  margin-bottom: 28px;
}

.page-header-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
}

.back-dashboard-button {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  padding: 0 16px;
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 750;
  text-decoration: none;
}

.back-dashboard-button:hover {
  background: #dbeafe;
}

.page-label {
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.page-header h1,
.modal-header h2 {
  margin: 9px 0;
  color: #0f172a;
}

.page-header h1 {
  font-size: clamp(
    2rem,
    4vw,
    3.2rem
  );
}

.page-header p,
.modal-header p,
.list-toolbar p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}

/* FEEDBACK */

.feedback-message {
  margin-bottom: 24px;
  padding: 14px 16px;
  border-radius: 9px;
  font-weight: 650;
}

.feedback-message.success {
  color: #166534;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
}

.feedback-message.error {
  color: #991b1b;
  background: #fee2e2;
  border: 1px solid #fecaca;
}

/* SUMMARY */

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 28px;
}

.summary-card {
  padding: 22px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow:
    0 8px 24px
    rgba(15, 23, 42, 0.05);
}

.summary-card span {
  display: block;
  margin-bottom: 12px;
  color: #64748b;
  font-size: 0.88rem;
  font-weight: 700;
}

.summary-card strong {
  color: #0f172a;
  font-size: 2rem;
}

/* PANEL */

.applications-panel {
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 15px;
  box-shadow:
    0 8px 24px
    rgba(15, 23, 42, 0.05);
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  padding: 24px 28px;
  border-bottom: 1px solid #e2e8f0;
}

.list-toolbar h2 {
  margin: 0 0 5px;
  color: #0f172a;
}

.toolbar-controls {
  display: flex;
  gap: 12px;
}

.search-input,
.filter-select,
.status-select {
  padding: 11px 13px;
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
}

.search-input {
  width: 290px;
}

.search-input:focus,
.filter-select:focus,
.status-select:focus {
  border-color: #2563eb;
  outline: 3px solid
    rgba(37, 99, 235, 0.12);
}

/* TABLE */

.table-wrapper {
  overflow-x: auto;
}

.applications-table {
  width: 100%;
  border-collapse: collapse;
}

.applications-table th,
.applications-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.applications-table th {
  color: #475569;
  background: #f8fafc;
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.applications-table tbody tr:hover {
  background: #f8fafc;
}

.applicant-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.applicant-cell span {
  display: block;
  margin-top: 4px;
  color: #64748b;
  font-size: 0.83rem;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: #1d4ed8;
  background: #dbeafe;
  border-radius: 50%;
  font-weight: 800;
}

.actions-column {
  text-align: right;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.view-button,
.delete-button,
.secondary-button,
.cv-button,
.modal-close-button {
  cursor: pointer;
  font: inherit;
}

.view-button,
.delete-button {
  padding: 8px 12px;
  background: #ffffff;
  border-radius: 7px;
  font-weight: 700;
}

.view-button {
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.delete-button {
  color: #b91c1c;
  border: 1px solid #fecaca;
}

/* STATUS */

.status-select {
  font-size: 0.82rem;
  font-weight: 750;
}

.status-select.new {
  color: #1d4ed8;
  background: #dbeafe;
}

.status-select.reviewed {
  color: #0369a1;
  background: #e0f2fe;
}

.status-select.shortlisted {
  color: #854d0e;
  background: #fef9c3;
}

.status-select.interview {
  color: #9a3412;
  background: #ffedd5;
}

.status-select.hired {
  color: #166534;
  background: #dcfce7;
}

.status-select.rejected {
  color: #991b1b;
  background: #fee2e2;
}

/* EMPTY STATE */

.empty-state {
  padding: 60px 25px;
  color: #64748b;
  text-align: center;
}

/* MODAL */

.modal-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    rgba(15, 23, 42, 0.65);
}

.application-modal {
  width: min(850px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 16px;
  box-shadow:
    0 30px 80px
    rgba(15, 23, 42, 0.28);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 26px 28px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  font-size: 1.5rem;
}

.modal-content {
  padding: 28px;
}

.details-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.detail-item {
  padding: 17px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.detail-item span {
  display: block;
  margin-bottom: 7px;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 700;
}

.detail-item a {
  color: #1d4ed8;
  font-weight: 700;
  text-decoration: none;
}

.text-section {
  margin-top: 22px;
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.text-section h3 {
  margin: 0 0 10px;
  color: #0f172a;
}

.text-section p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
  white-space: pre-line;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 26px;
}

.secondary-button,
.cv-button {
  padding: 12px 18px;
  border-radius: 8px;
  font-weight: 750;
}

.secondary-button {
  color: #334155;
  background: #ffffff;
  border: 1px solid #cbd5e1;
}

.cv-button {
  color: #ffffff;
  background: #2563eb;
  border: none;
}

.cv-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

/* MOBILE */

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .list-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-controls {
    width: 100%;
  }

  .search-input,
  .filter-select {
    flex: 1;
    width: 100%;
  }
}

@media (max-width: 650px) {
  .applications-page {
    padding: 28px 18px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-controls {
    flex-direction: column;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .modal-overlay {
    padding: 12px;
  }

  .modal-header,
  .modal-content {
    padding: 20px;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions button {
    width: 100%;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  align-items: center;
  margin-bottom: 30px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.primary-button,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 16px;
  border-radius: 8px;
  font: inherit;
  font-weight: 700;
  text-decoration: none;
}

.primary-button {
  color: #ffffff;
  background: #2563eb;
  border: none;
  cursor: pointer;
}

.primary-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.secondary-button {
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #cbd5e1;
}

@media (max-width: 760px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>