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
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import { db, storage } from "../../firebase";

import {
  deleteObject,
  ref as storageRef
} from "firebase/storage";

const loanApplications = ref([]);
const selectedApplication = ref(null);

const isLoading = ref(true);
const isUpdating = ref(false);
const deletingApplicationId = ref("");

const searchTerm = ref("");
const statusFilter = ref("all");

const message = ref("");
const messageType = ref("");

const applicationStatuses = [
  {
    value: "pending",
    label: "Pending"
  },
  {
    value: "approved",
    label: "Approved"
  },
  {
    value: "rejected",
    label: "Rejected"
  }
];

const loadLoanApplications = async () => {
  isLoading.value = true;
  message.value = "";
  messageType.value = "";

  try {
    const applicationsQuery = query(
      collection(db, "loanApplications"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(
      applicationsQuery
    );

    loanApplications.value =
      snapshot.docs.map(
        (applicationDocument) => ({
          id: applicationDocument.id,
          ...applicationDocument.data()
        })
      );
  } catch (error) {
    console.error(
      "Unable to load loan applications:",
      error
    );

    message.value =
      "Loan applications could not be loaded.";

    messageType.value = "error";
  } finally {
    isLoading.value = false;
  }
};

const filteredApplications = computed(() => {
  const search = searchTerm.value
    .trim()
    .toLowerCase();

  return loanApplications.value.filter(
    (application) => {
      const status =
        application.applicationStatus ||
        "pending";

      const matchesStatus =
        statusFilter.value === "all" ||
        status === statusFilter.value;

      const searchableContent = [
        application.applicationReference,
        application.fullName,
        application.phoneNumber,
        application.emailAddress,
        application.requestedAmount,
        application.loanPurpose,
        status
      ]
        .filter(
          (value) =>
            value !== undefined &&
            value !== null
        )
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !search ||
        searchableContent.includes(search);

      return (
        matchesStatus &&
        matchesSearch
      );
    }
  );
});

const totalApplications = computed(
  () => loanApplications.value.length
);

const pendingApplications = computed(
  () =>
    loanApplications.value.filter(
      (application) =>
        !application.applicationStatus ||
        application.applicationStatus ===
          "pending"
    ).length
);

const approvedApplications = computed(
  () =>
    loanApplications.value.filter(
      (application) =>
        application.applicationStatus ===
        "approved"
    ).length
);

const rejectedApplications = computed(
  () =>
    loanApplications.value.filter(
      (application) =>
        application.applicationStatus ===
        "rejected"
    ).length
);

const getStatusLabel = (status) => {
  const matchingStatus =
    applicationStatuses.find(
      (item) =>
        item.value ===
        (status || "pending")
    );

  return matchingStatus?.label || "Pending";
};

const getStatusClass = (status) => {
  return `status-${status || "pending"}`;
};

const formatAmount = (amount) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return "Not available";
  }

  return new Intl.NumberFormat(
    "en-ZA",
    {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }
  ).format(numericAmount);
};

const formatCreatedDate = (timestamp) => {
  if (!timestamp) {
    return "Not available";
  }

  const date =
    typeof timestamp.toDate === "function"
      ? timestamp.toDate()
      : new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-ZA",
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  ).format(date);
};

const openApplicationDetails = async (application) => {
  if (application?.id && application.viewedByAdmin !== true) {
    try {
      await updateDoc(doc(db, "loanApplications", application.id), {
        viewedByAdmin: true,
        viewedAt: serverTimestamp()
      });

      application.viewedByAdmin = true;
    } catch (error) {
      console.error("Unable to mark item as viewed:", error);
    }
  }

  selectedApplication.value = {
    ...application
  };

  message.value = "";
  messageType.value = "";
};

const closeApplicationDetails = () => {
  selectedApplication.value = null;
};

const updateApplicationStatus = async (
  application,
  newStatus
) => {
  if (!application?.id || !newStatus) {
    return;
  }

  isUpdating.value = true;
  message.value = "";
  messageType.value = "";

  try {
    await updateDoc(
      doc(
        db,
        "loanApplications",
        application.id
      ),
      {
        applicationStatus: newStatus,
        updatedAt: serverTimestamp()
      }
    );

    const applicationIndex =
      loanApplications.value.findIndex(
        (item) =>
          item.id === application.id
      );

    if (applicationIndex !== -1) {
      loanApplications.value[
        applicationIndex
      ].applicationStatus = newStatus;
    }

    if (
      selectedApplication.value?.id ===
      application.id
    ) {
      selectedApplication.value
        .applicationStatus = newStatus;
    }

    message.value =
      `Application marked as ${getStatusLabel(
        newStatus
      ).toLowerCase()}.`;

    messageType.value = "success";
  } catch (error) {
    console.error(
      "Unable to update application status:",
      error
    );

    message.value =
      "The application status could not be updated.";

    messageType.value = "error";
  } finally {
    isUpdating.value = false;
  }
};

const deleteLoanDocument = async (documentUrl) => {
  if (!documentUrl) {
    return;
  }

  try {
    const documentReference = storageRef(
      storage,
      documentUrl
    );

    await deleteObject(documentReference);
  } catch (error) {
    if (error?.code === "storage/object-not-found") {
      console.warn(
        "Loan document was already missing:",
        documentUrl
      );

      return;
    }

    throw error;
  }
};

const removeApplication = async (
  application
) => {
  if (!application?.id) {
    return;
  }

  const applicantName =
    application.fullName ||
    "this applicant";

  const confirmed = window.confirm(
    `Delete the loan application from ${applicantName}? The application and all uploaded documents will be permanently deleted.`
  );

  if (!confirmed) {
    return;
  }

  deletingApplicationId.value =
    application.id;

  message.value = "";
  messageType.value = "";

  try {
    const documentUrls = [
      application.southAfricanIdUrl,
      application.bankStatementUrl,
      application.payslipUrl
    ].filter(Boolean);

    await Promise.all(
      documentUrls.map((documentUrl) =>
        deleteLoanDocument(documentUrl)
      )
    );

    await deleteDoc(
      doc(
        db,
        "loanApplications",
        application.id
      )
    );

    loanApplications.value =
      loanApplications.value.filter(
        (item) =>
          item.id !== application.id
      );

    if (
      selectedApplication.value?.id ===
      application.id
    ) {
      closeApplicationDetails();
    }

    message.value =
      "The loan application and its supporting documents were deleted.";

    messageType.value = "success";
  } catch (error) {
    console.error(
      "Unable to delete loan application:",
      error
    );

    if (error?.code === "storage/unauthorized") {
      message.value =
        "The application could not be deleted because the admin does not have permission to delete the uploaded documents.";
    } else {
      message.value =
        "The loan application or one of its documents could not be deleted.";
    }

    messageType.value = "error";
  } finally {
    deletingApplicationId.value = "";
  }
};

const getTelephoneLink = (phone) => {
  if (!phone) {
    return "#";
  }

  const cleanedPhone = phone.replace(
    /[^\d+]/g,
    ""
  );

  return `tel:${cleanedPhone}`;
};

const getEmailLink = (application) => {
  if (!application?.emailAddress) {
    return "#";
  }

  const subject = encodeURIComponent(
    `RMC Group loan application ${
      application.applicationReference || ""
    }`
  );

  const body = encodeURIComponent(
    `Hello ${
      application.fullName || ""
    },\n\nWe are contacting you regarding your RMC Group loan application ${
      application.applicationReference || ""
    }.\n\n`
  );

  return `mailto:${application.emailAddress}?subject=${subject}&body=${body}`;
};

onMounted(() => {
  loadLoanApplications();
});
</script>

<template>
  <div class="admin-page">
    <header class="page-header">
      <div>
        <span class="page-label">
          Loan Management
        </span>

        <h1>Loan applications</h1>

        <p>
          Review, approve, reject and manage
          submitted short-term loan applications.
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
          @click="loadLoanApplications"
        >
          {{
            isLoading
              ? "Loading..."
              : "Refresh"
          }}
        </button>
      </div>
    </header>

    <div
      v-if="message"
      :class="[
        'page-message',
        messageType
      ]"
    >
      {{ message }}
    </div>

    <section class="summary-grid">
      <article class="summary-card">
        <span>Total applications</span>

        <strong>
          {{ totalApplications }}
        </strong>
      </article>

      <article class="summary-card">
        <span>Pending</span>

        <strong>
          {{ pendingApplications }}
        </strong>
      </article>

      <article class="summary-card">
        <span>Approved</span>

        <strong>
          {{ approvedApplications }}
        </strong>
      </article>

      <article class="summary-card">
        <span>Rejected</span>

        <strong>
          {{ rejectedApplications }}
        </strong>
      </article>
    </section>

    <section class="filter-panel">
      <div class="filter-group search-group">
        <label for="application-search">
          Search applications
        </label>

        <input
          id="application-search"
          v-model="searchTerm"
          type="search"
          placeholder="Search name, phone, email or reference"
        />
      </div>

      <div class="filter-group">
        <label for="status-filter">
          Status
        </label>

        <select
          id="status-filter"
          v-model="statusFilter"
        >
          <option value="all">
            All statuses
          </option>

          <option
            v-for="status in applicationStatuses"
            :key="status.value"
            :value="status.value"
          >
            {{ status.label }}
          </option>
        </select>
      </div>
    </section>

    <section class="applications-panel">
      <div
        v-if="isLoading"
        class="empty-state"
      >
        Loading loan applications...
      </div>

      <div
        v-else-if="
          filteredApplications.length === 0
        "
        class="empty-state"
      >
        No loan applications were found.
      </div>

      <div
        v-else
        class="table-wrapper"
      >
        <table class="applications-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Amount</th>
              <th>Contact</th>
              <th>Submitted</th>
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
                <strong>
                  {{
                    application.fullName ||
                    "Not provided"
                  }}
                </strong>

                <small>
                  {{
                    application.applicationReference ||
                    "No reference"
                  }}
                </small>
              </td>

              <td>
                <strong class="amount-text">
                  {{
                    formatAmount(
                      application.requestedAmount
                    )
                  }}
                </strong>
              </td>

              <td>
                <a
                  v-if="application.emailAddress"
                  :href="
                    `mailto:${application.emailAddress}`
                  "
                  class="contact-link"
                >
                  {{ application.emailAddress }}
                </a>

                <small>
                  {{
                    application.phoneNumber ||
                    "No phone number"
                  }}
                </small>
              </td>

              <td>
                {{
                  formatCreatedDate(
                    application.createdAt
                  )
                }}
              </td>

              <td>
                <span
                  :class="[
                    'status-badge',
                    getStatusClass(
                      application.applicationStatus
                    )
                  ]"
                >
                  {{
                    getStatusLabel(
                      application.applicationStatus
                    )
                  }}
                </span>
              </td>

              <td>
                <div class="table-actions">
                  <button
                    type="button"
                    class="view-button"
                    @click="
                      openApplicationDetails(
                        application
                      )
                    "
                  >
                    View
                  </button>

                  <button
                    type="button"
                    class="delete-button"
                    :disabled="
                      deletingApplicationId ===
                      application.id
                    "
                    @click="
                      removeApplication(
                        application
                      )
                    "
                  >
                    {{
                      deletingApplicationId ===
                      application.id
                        ? "Deleting..."
                        : "Delete"
                    }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div
      v-if="selectedApplication"
      class="modal-overlay"
      @click.self="
        closeApplicationDetails
      "
    >
      <section class="application-modal">
        <header class="modal-header">
          <div>
            <span class="page-label">
              Application Details
            </span>

            <h2>
              {{
                selectedApplication.fullName ||
                "Loan applicant"
              }}
            </h2>
          </div>

          <button
            type="button"
            class="close-button"
            aria-label="Close application details"
            @click="
              closeApplicationDetails
            "
          >
            ×
          </button>
        </header>

        <div class="details-grid">
          <div class="detail-item">
            <span>
              Application reference
            </span>

            <strong>
              {{
                selectedApplication
                  .applicationReference ||
                "Not available"
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Status</span>

            <strong>
              {{
                getStatusLabel(
                  selectedApplication
                    .applicationStatus
                )
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Full name</span>

            <strong>
              {{
                selectedApplication.fullName ||
                "Not provided"
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Requested amount</span>

            <strong class="amount-text">
              {{
                formatAmount(
                  selectedApplication
                    .requestedAmount
                )
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Email address</span>

            <strong>
              {{
                selectedApplication
                  .emailAddress ||
                "Not provided"
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Phone number</span>

            <strong>
              {{
                selectedApplication
                  .phoneNumber ||
                "Not provided"
              }}
            </strong>
          </div>

          <div class="detail-item full-width">
            <span>Purpose of loan</span>

            <p class="purpose-text">
              {{
                selectedApplication
                  .loanPurpose ||
                "No purpose provided"
              }}
            </p>
          </div>

          <div class="detail-item">
            <span>Consent provided</span>

            <strong>
              {{
                selectedApplication
                  .consentProvided
                  ? "Yes"
                  : "No"
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Submitted</span>

            <strong>
              {{
                formatCreatedDate(
                  selectedApplication.createdAt
                )
              }}
            </strong>
          </div>
        </div>

        <div class="documents-section">
          <div class="documents-section-heading">
            <div>
              <span class="page-label">
                Applicant Documents
              </span>

              <h3>Supporting documents</h3>
            </div>

            <span class="documents-count">
              {{
                [
                  selectedApplication.southAfricanIdUrl,
                  selectedApplication.bankStatementUrl,
                  selectedApplication.payslipUrl
                ].filter(Boolean).length
              }}
              of 3 uploaded
            </span>
          </div>

          <div class="documents-list">
            <article class="document-item">
              <div class="document-information">
                <span class="document-icon">ID</span>

                <div>
                  <strong>South African ID</strong>
                  <small>
                    {{
                      selectedApplication.southAfricanIdFileName ||
                      "Copy of South African ID"
                    }}
                  </small>
                </div>
              </div>

              <a
                v-if="selectedApplication.southAfricanIdUrl"
                :href="selectedApplication.southAfricanIdUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="document-button"
              >
                View Document
              </a>

              <span v-else class="document-missing">
                Not uploaded
              </span>
            </article>

            <article class="document-item">
              <div class="document-information">
                <span class="document-icon">BS</span>

                <div>
                  <strong>Three-Month Bank Statement</strong>
                  <small>
                    {{
                      selectedApplication.bankStatementFileName ||
                      "Latest three-month bank statement"
                    }}
                  </small>
                </div>
              </div>

              <a
                v-if="selectedApplication.bankStatementUrl"
                :href="selectedApplication.bankStatementUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="document-button"
              >
                View Document
              </a>

              <span v-else class="document-missing">
                Not uploaded
              </span>
            </article>

            <article class="document-item">
              <div class="document-information">
                <span class="document-icon">PS</span>

                <div>
                  <strong>Three Recent Payslips</strong>
                  <small>
                    {{
                      selectedApplication.payslipFileName ||
                      "Applicant payslips"
                    }}
                  </small>
                </div>
              </div>

              <a
                v-if="selectedApplication.payslipUrl"
                :href="selectedApplication.payslipUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="document-button"
              >
                View Document
              </a>

              <span v-else class="document-missing">
                Not uploaded
              </span>
            </article>
          </div>
        </div>

        <div class="status-section">
          <h3>Application decision</h3>

          <p>
            Update the status after reviewing
            the applicant's information.
          </p>

          <div class="status-buttons">
            <button
              type="button"
              class="pending-button"
              :disabled="isUpdating"
              @click="
                updateApplicationStatus(
                  selectedApplication,
                  'pending'
                )
              "
            >
              Mark Pending
            </button>

            <button
              type="button"
              class="approve-button"
              :disabled="isUpdating"
              @click="
                updateApplicationStatus(
                  selectedApplication,
                  'approved'
                )
              "
            >
              Approve
            </button>

            <button
              type="button"
              class="reject-button"
              :disabled="isUpdating"
              @click="
                updateApplicationStatus(
                  selectedApplication,
                  'rejected'
                )
              "
            >
              Reject
            </button>
          </div>
        </div>

        <div class="modal-actions">
          <a
            :href="
              getEmailLink(
                selectedApplication
              )
            "
            class="primary-button"
          >
            Email Applicant
          </a>

          <a
            v-if="
              selectedApplication.phoneNumber
            "
            :href="
              getTelephoneLink(
                selectedApplication
                  .phoneNumber
              )
            "
            class="secondary-button"
          >
            Call Applicant
          </a>

          <button
            type="button"
            class="delete-button"
            :disabled="
              deletingApplicationId ===
              selectedApplication.id
            "
            @click="
              removeApplication(
                selectedApplication
              )
            "
          >
            Delete Application
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.admin-page {
  min-height: 100vh;
  padding: 42px;
  color: #1e293b;
  background: #f1f5f9;
  font-family: "Segoe UI", Arial, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  align-items: center;
  margin-bottom: 30px;
}

.page-label {
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.page-header h1 {
  margin: 9px 0;
  color: #0f172a;
  font-size: clamp(2rem, 4vw, 3.2rem);
}

.page-header p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}

.header-actions,
.table-actions,
.modal-actions,
.status-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.primary-button,
.secondary-button,
.view-button,
.delete-button,
.pending-button,
.approve-button,
.reject-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 16px;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  text-decoration: none;
}

.primary-button {
  color: #ffffff;
  background: #2563eb;
  border: none;
}

.secondary-button {
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #cbd5e1;
}

.view-button {
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.delete-button,
.reject-button {
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.pending-button {
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.approve-button {
  color: #166534;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.page-message {
  margin-bottom: 22px;
  padding: 14px 16px;
  border-radius: 9px;
  font-weight: 650;
}

.page-message.success {
  color: #166534;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
}

.page-message.error {
  color: #991b1b;
  background: #fee2e2;
  border: 1px solid #fecaca;
}

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.summary-card {
  padding: 22px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
}

.summary-card span {
  display: block;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 700;
}

.summary-card strong {
  display: block;
  margin-top: 12px;
  color: #0f172a;
  font-size: 2rem;
}

.filter-panel {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    240px;
  gap: 18px;
  margin-bottom: 24px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.filter-group label {
  color: #334155;
  font-size: 0.88rem;
  font-weight: 750;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 12px 13px;
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
}

.filter-group input:focus,
.filter-group select:focus {
  border-color: #2563eb;
  outline: 3px solid rgba(37, 99, 235, 0.12);
}

.applications-panel {
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.table-wrapper {
  overflow-x: auto;
}

.applications-table {
  width: 100%;
  border-collapse: collapse;
}

.applications-table th,
.applications-table td {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: middle;
}

.applications-table th {
  color: #475569;
  background: #f8fafc;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.applications-table td strong,
.applications-table td small {
  display: block;
}

.applications-table td small {
  margin-top: 5px;
  color: #64748b;
}

.amount-text {
  color: #0f172a;
  white-space: nowrap;
}

.contact-link {
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
}

.status-badge {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
}

.status-pending {
  color: #1d4ed8;
  background: #dbeafe;
}

.status-approved {
  color: #166534;
  background: #dcfce7;
}

.status-rejected {
  color: #991b1b;
  background: #fee2e2;
}

.actions-column {
  min-width: 170px;
}

.empty-state {
  padding: 60px 20px;
  color: #64748b;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.72);
}

.application-modal {
  width: min(800px, 100%);
  max-height: 90vh;
  padding: 28px;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 25px 70px rgba(15, 23, 42, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 7px 0 0;
  color: #0f172a;
}

.close-button {
  width: 40px;
  height: 40px;
  color: #475569;
  background: #f1f5f9;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
}

.details-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.detail-item {
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item span,
.detail-item strong {
  display: block;
}

.detail-item span {
  margin-bottom: 7px;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 700;
}

.detail-item strong {
  color: #0f172a;
  overflow-wrap: anywhere;
}

.purpose-text {
  margin: 0;
  color: #334155;
  line-height: 1.7;
  white-space: pre-wrap;
}

.documents-section {
  margin-top: 22px;
  padding: 22px;
  background: #ffffff;
  border: 1px solid #dbeafe;
  border-radius: 12px;
}

.documents-section-heading {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  margin-bottom: 18px;
}

.documents-section-heading h3 {
  margin: 6px 0 0;
  color: #0f172a;
}

.documents-count {
  padding: 7px 11px;
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.documents-list {
  display: grid;
  gap: 12px;
}

.document-item {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  padding: 15px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.document-information {
  display: flex;
  gap: 13px;
  align-items: center;
  min-width: 0;
}

.document-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  color: #ffffff;
  background: #2563eb;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 800;
}

.document-information div {
  min-width: 0;
}

.document-information strong,
.document-information small {
  display: block;
}

.document-information strong {
  margin-bottom: 5px;
  color: #0f172a;
}

.document-information small {
  color: #64748b;
  overflow-wrap: anywhere;
}

.document-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  color: #ffffff;
  background: #2563eb;
  border-radius: 8px;
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.document-button:hover {
  background: #1d4ed8;
}

.document-missing {
  padding: 8px 11px;
  color: #991b1b;
  background: #fee2e2;
  border-radius: 7px;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
}

.status-section {
  margin-top: 22px;
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.status-section h3 {
  margin: 0 0 7px;
  color: #0f172a;
}

.status-section p {
  margin: 0 0 16px;
  color: #64748b;
}

.status-buttons {
  flex-wrap: wrap;
}

.modal-actions {
  flex-wrap: wrap;
  margin-top: 24px;
  padding-top: 22px;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 1000px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .admin-page {
    padding: 28px 18px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .filter-panel,
  .details-grid {
    grid-template-columns: 1fr;
  }

  .detail-item.full-width {
    grid-column: auto;
  }

  .modal-actions > *,
  .status-buttons > * {
    width: 100%;
  }

  .documents-section-heading,
  .document-item {
    align-items: stretch;
    flex-direction: column;
  }

  .documents-count {
    align-self: flex-start;
  }

  .document-button {
    width: 100%;
  }

  .document-missing {
    align-self: flex-start;
  }
}

@media (max-width: 520px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .application-modal {
    padding: 22px 17px;
  }
}
</style>