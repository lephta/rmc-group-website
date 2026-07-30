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

import { db } from "../../firebase";

const enquiries = ref([]);
const selectedEnquiry = ref(null);

const isLoading = ref(true);
const isUpdating = ref(false);
const deletingEnquiryId = ref("");

const message = ref("");
const messageType = ref("");

const searchTerm = ref("");
const statusFilter = ref("all");
const serviceFilter = ref("all");

const enquiryStatuses = [
  {
    value: "new",
    label: "New"
  },
  {
    value: "contacted",
    label: "Contacted"
  },
  {
    value: "closed",
    label: "Closed"
  }
];

const serviceOptions = [
  "Recruitment",
  "Pest Control",
  "Short Term Loans",
  "General enquiry"
];

const loadEnquiries = async () => {
  isLoading.value = true;
  message.value = "";
  messageType.value = "";

  try {
    const enquiriesQuery = query(
      collection(db, "contactEnquiries"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(enquiriesQuery);

    enquiries.value = snapshot.docs.map(
      (enquiryDocument) => ({
        id: enquiryDocument.id,
        ...enquiryDocument.data()
      })
    );
  } catch (error) {
    console.error(
      "Unable to load contact enquiries:",
      error
    );

    message.value =
      "Contact enquiries could not be loaded.";

    messageType.value = "error";
  } finally {
    isLoading.value = false;
  }
};

const filteredEnquiries = computed(() => {
  const search = searchTerm.value
    .trim()
    .toLowerCase();

  return enquiries.value.filter((enquiry) => {
    const matchesStatus =
      statusFilter.value === "all" ||
      enquiry.status === statusFilter.value;

    const matchesService =
      serviceFilter.value === "all" ||
      enquiry.service === serviceFilter.value;

    const searchableContent = [
      enquiry.enquiryReference,
      enquiry.name,
      enquiry.email,
      enquiry.phone,
      enquiry.service,
      enquiry.message,
      enquiry.status
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      !search ||
      searchableContent.includes(search);

    return (
      matchesStatus &&
      matchesService &&
      matchesSearch
    );
  });
});

const getStatusLabel = (status) => {
  const matchingStatus = enquiryStatuses.find(
    (item) => item.value === status
  );

  return matchingStatus?.label || "New";
};

const getStatusClass = (status) => {
  return `status-${status || "new"}`;
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

const openEnquiryDetails = async (enquiry) => {
  if (enquiry?.id && enquiry.viewedByAdmin !== true) {
    try {
      await updateDoc(doc(db, "contactEnquiries", enquiry.id), {
        viewedByAdmin: true,
        viewedAt: serverTimestamp()
      });

      enquiry.viewedByAdmin = true;
    } catch (error) {
      console.error("Unable to mark item as viewed:", error);
    }
  }

  selectedEnquiry.value = {
    ...enquiry
  };

  message.value = "";
  messageType.value = "";
};

const closeEnquiryDetails = () => {
  selectedEnquiry.value = null;
};

const updateEnquiryStatus = async (
  enquiry,
  newStatus
) => {
  if (!enquiry?.id || !newStatus) {
    return;
  }

  isUpdating.value = true;
  message.value = "";
  messageType.value = "";

  try {
    await updateDoc(
      doc(
        db,
        "contactEnquiries",
        enquiry.id
      ),
      {
        status: newStatus,
        updatedAt: serverTimestamp()
      }
    );

    const enquiryIndex =
      enquiries.value.findIndex(
        (item) => item.id === enquiry.id
      );

    if (enquiryIndex !== -1) {
      enquiries.value[enquiryIndex].status =
        newStatus;
    }

    if (
      selectedEnquiry.value?.id ===
      enquiry.id
    ) {
      selectedEnquiry.value.status =
        newStatus;
    }

    message.value =
      "Enquiry status updated successfully.";

    messageType.value = "success";
  } catch (error) {
    console.error(
      "Unable to update enquiry status:",
      error
    );

    message.value =
      "The enquiry status could not be updated.";

    messageType.value = "error";
  } finally {
    isUpdating.value = false;
  }
};

const removeEnquiry = async (enquiry) => {
  if (!enquiry?.id) {
    return;
  }

  const customerName =
    enquiry.name || "this customer";

  const confirmed = window.confirm(
    `Delete the enquiry from ${customerName}? This action cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  deletingEnquiryId.value = enquiry.id;
  message.value = "";
  messageType.value = "";

  try {
    await deleteDoc(
      doc(
        db,
        "contactEnquiries",
        enquiry.id
      )
    );

    enquiries.value =
      enquiries.value.filter(
        (item) => item.id !== enquiry.id
      );

    if (
      selectedEnquiry.value?.id ===
      enquiry.id
    ) {
      closeEnquiryDetails();
    }

    message.value =
      "The contact enquiry was deleted.";

    messageType.value = "success";
  } catch (error) {
    console.error(
      "Unable to delete contact enquiry:",
      error
    );

    message.value =
      "The enquiry could not be deleted.";

    messageType.value = "error";
  } finally {
    deletingEnquiryId.value = "";
  }
};

const callCustomer = (phone) => {
  if (!phone) {
    return "#";
  }

  const cleanedPhone = phone.replace(
    /[^\d+]/g,
    ""
  );

  return `tel:${cleanedPhone}`;
};

const emailCustomer = (enquiry) => {
  if (!enquiry?.email) {
    return "#";
  }

  const subject = encodeURIComponent(
    `RMC Group enquiry ${enquiry.enquiryReference || ""}`
  );

  const body = encodeURIComponent(
    `Hello ${enquiry.name || ""},\n\nThank you for contacting RMC Group regarding ${enquiry.service || "your enquiry"}.\n\n`
  );

  return `mailto:${enquiry.email}?subject=${subject}&body=${body}`;
};

onMounted(() => {
  loadEnquiries();
});
</script>

<template>
  <div class="admin-page">
    <header class="page-header">
      <div>
        <span class="page-label">
          Customer Communication
        </span>

        <h1>Contact enquiries</h1>

        <p>
          View and manage messages submitted
          through the RMC Group contact page.
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
          @click="loadEnquiries"
        >
          {{ isLoading ? "Loading..." : "Refresh" }}
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
        <span>Total enquiries</span>

        <strong>
          {{ enquiries.length }}
        </strong>
      </article>

      <article class="summary-card">
        <span>New enquiries</span>

        <strong>
          {{
            enquiries.filter(
              (enquiry) =>
                !enquiry.status ||
                enquiry.status === "new"
            ).length
          }}
        </strong>
      </article>

      <article class="summary-card">
        <span>Contacted</span>

        <strong>
          {{
            enquiries.filter(
              (enquiry) =>
                enquiry.status === "contacted"
            ).length
          }}
        </strong>
      </article>

      <article class="summary-card">
        <span>Closed</span>

        <strong>
          {{
            enquiries.filter(
              (enquiry) =>
                enquiry.status === "closed"
            ).length
          }}
        </strong>
      </article>
    </section>

    <section class="filter-panel">
      <div class="filter-group search-group">
        <label for="enquiry-search">
          Search enquiries
        </label>

        <input
          id="enquiry-search"
          v-model="searchTerm"
          type="search"
          placeholder="Search name, email, phone, service or reference"
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
            v-for="status in enquiryStatuses"
            :key="status.value"
            :value="status.value"
          >
            {{ status.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="service-filter">
          Service
        </label>

        <select
          id="service-filter"
          v-model="serviceFilter"
        >
          <option value="all">
            All services
          </option>

          <option
            v-for="service in serviceOptions"
            :key="service"
            :value="service"
          >
            {{ service }}
          </option>
        </select>
      </div>
    </section>

    <section class="enquiries-panel">
      <div
        v-if="isLoading"
        class="empty-state"
      >
        Loading contact enquiries...
      </div>

      <div
        v-else-if="filteredEnquiries.length === 0"
        class="empty-state"
      >
        No contact enquiries were found.
      </div>

      <div
        v-else
        class="table-wrapper"
      >
        <table class="enquiries-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service</th>
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
              v-for="enquiry in filteredEnquiries"
              :key="enquiry.id"
            >
              <td>
                <strong>
                  {{ enquiry.name || "Not provided" }}
                </strong>

                <small>
                  {{
                    enquiry.enquiryReference ||
                    "No reference"
                  }}
                </small>
              </td>

              <td>
                {{
                  enquiry.service ||
                  "General enquiry"
                }}
              </td>

              <td>
                <a
                  v-if="enquiry.email"
                  :href="`mailto:${enquiry.email}`"
                  class="contact-link"
                >
                  {{ enquiry.email }}
                </a>

                <small>
                  {{
                    enquiry.phone ||
                    "No phone number"
                  }}
                </small>
              </td>

              <td>
                {{
                  formatCreatedDate(
                    enquiry.createdAt
                  )
                }}
              </td>

              <td>
                <span
                  :class="[
                    'status-badge',
                    getStatusClass(
                      enquiry.status
                    )
                  ]"
                >
                  {{
                    getStatusLabel(
                      enquiry.status
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
                      openEnquiryDetails(
                        enquiry
                      )
                    "
                  >
                    View
                  </button>

                  <button
                    type="button"
                    class="delete-button"
                    :disabled="
                      deletingEnquiryId ===
                      enquiry.id
                    "
                    @click="
                      removeEnquiry(enquiry)
                    "
                  >
                    {{
                      deletingEnquiryId ===
                      enquiry.id
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
      v-if="selectedEnquiry"
      class="modal-overlay"
      @click.self="closeEnquiryDetails"
    >
      <section class="enquiry-modal">
        <header class="modal-header">
          <div>
            <span class="page-label">
              Enquiry Details
            </span>

            <h2>
              {{ selectedEnquiry.name }}
            </h2>
          </div>

          <button
            type="button"
            class="close-button"
            aria-label="Close enquiry details"
            @click="closeEnquiryDetails"
          >
            ×
          </button>
        </header>

        <div class="details-grid">
          <div class="detail-item">
            <span>Reference</span>

            <strong>
              {{
                selectedEnquiry.enquiryReference ||
                "Not available"
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Status</span>

            <strong>
              {{
                getStatusLabel(
                  selectedEnquiry.status
                )
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Customer name</span>

            <strong>
              {{
                selectedEnquiry.name ||
                "Not provided"
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Service</span>

            <strong>
              {{
                selectedEnquiry.service ||
                "General enquiry"
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Email address</span>

            <strong>
              {{
                selectedEnquiry.email ||
                "Not provided"
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Phone number</span>

            <strong>
              {{
                selectedEnquiry.phone ||
                "Not provided"
              }}
            </strong>
          </div>

          <div class="detail-item full-width">
            <span>Customer message</span>

            <p class="customer-message">
              {{
                selectedEnquiry.message ||
                "No message provided"
              }}
            </p>
          </div>

          <div class="detail-item">
            <span>Source</span>

            <strong>
              {{
                selectedEnquiry.source ||
                "RMC website"
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Submitted</span>

            <strong>
              {{
                formatCreatedDate(
                  selectedEnquiry.createdAt
                )
              }}
            </strong>
          </div>
        </div>

        <div class="status-control">
          <label for="enquiry-status">
            Change enquiry status
          </label>

          <select
            id="enquiry-status"
            :value="
              selectedEnquiry.status || 'new'
            "
            :disabled="isUpdating"
            @change="
              updateEnquiryStatus(
                selectedEnquiry,
                $event.target.value
              )
            "
          >
            <option
              v-for="status in enquiryStatuses"
              :key="status.value"
              :value="status.value"
            >
              {{ status.label }}
            </option>
          </select>
        </div>

        <div class="modal-actions">
          <a
            :href="emailCustomer(selectedEnquiry)"
            class="primary-button"
          >
            Email Customer
          </a>

          <a
            v-if="selectedEnquiry.phone"
            :href="
              callCustomer(
                selectedEnquiry.phone
              )
            "
            class="secondary-button"
          >
            Call Customer
          </a>

          <button
            type="button"
            class="delete-button"
            :disabled="
              deletingEnquiryId ===
              selectedEnquiry.id
            "
            @click="
              removeEnquiry(
                selectedEnquiry
              )
            "
          >
            Delete Enquiry
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
.modal-actions,
.table-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.primary-button,
.secondary-button,
.view-button,
.delete-button {
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

.delete-button {
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
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
    220px
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

.filter-group label,
.status-control label {
  color: #334155;
  font-size: 0.88rem;
  font-weight: 750;
}

.filter-group input,
.filter-group select,
.status-control select {
  width: 100%;
  padding: 12px 13px;
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
}

.filter-group input:focus,
.filter-group select:focus,
.status-control select:focus {
  border-color: #2563eb;
  outline: 3px solid rgba(37, 99, 235, 0.12);
}

.enquiries-panel {
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.table-wrapper {
  overflow-x: auto;
}

.enquiries-table {
  width: 100%;
  border-collapse: collapse;
}

.enquiries-table th,
.enquiries-table td {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: middle;
}

.enquiries-table th {
  color: #475569;
  background: #f8fafc;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.enquiries-table td strong,
.enquiries-table td small {
  display: block;
}

.enquiries-table td small {
  margin-top: 5px;
  color: #64748b;
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

.status-new {
  color: #1d4ed8;
  background: #dbeafe;
}

.status-contacted {
  color: #7c3aed;
  background: #ede9fe;
}

.status-closed {
  color: #166534;
  background: #dcfce7;
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

.enquiry-modal {
  width: min(760px, 100%);
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

.customer-message {
  margin: 0;
  color: #334155;
  line-height: 1.7;
  white-space: pre-wrap;
}

.status-control {
  margin-top: 22px;
}

.status-control select {
  margin-top: 8px;
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

  .filter-panel {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .search-group {
    grid-column: 1 / -1;
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

  .search-group,
  .detail-item.full-width {
    grid-column: auto;
  }

  .modal-actions > * {
    width: 100%;
  }
}

@media (max-width: 520px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .enquiry-modal {
    padding: 22px 17px;
  }
}
</style>