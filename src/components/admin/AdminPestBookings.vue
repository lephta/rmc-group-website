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

const bookings = ref([]);
const selectedBooking = ref(null);

const isLoading = ref(true);
const isUpdating = ref(false);
const deletingBookingId = ref("");

const message = ref("");
const messageType = ref("");

const searchTerm = ref("");
const statusFilter = ref("all");

const bookingStatuses = [
  {
    value: "new",
    label: "New"
  },
  {
    value: "contacted",
    label: "Contacted"
  },
  {
    value: "confirmed",
    label: "Confirmed"
  },
  {
    value: "completed",
    label: "Completed"
  },
  {
    value: "cancelled",
    label: "Cancelled"
  }
];

const loadBookings = async () => {
  isLoading.value = true;
  message.value = "";
  messageType.value = "";

  try {
    const bookingsQuery = query(
      collection(db, "pestBookings"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(bookingsQuery);

    bookings.value = snapshot.docs.map(
      (bookingDocument) => ({
        id: bookingDocument.id,
        ...bookingDocument.data()
      })
    );
  } catch (error) {
    console.error(
      "Unable to load pest bookings:",
      error
    );

    message.value =
      "Pest-control bookings could not be loaded.";

    messageType.value = "error";
  } finally {
    isLoading.value = false;
  }
};

const filteredBookings = computed(() => {
  const search = searchTerm.value
    .trim()
    .toLowerCase();

  return bookings.value.filter((booking) => {
    const matchesStatus =
      statusFilter.value === "all" ||
      booking.status === statusFilter.value;

    const searchableContent = [
      booking.name,
      booking.contact,
      booking.phone,
      booking.address,
      booking.bookingDate,
      booking.bookingTime,
      booking.bookingReference,
      booking.status
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      !search ||
      searchableContent.includes(search);

    return matchesStatus && matchesSearch;
  });
});

const getStatusLabel = (status) => {
  const matchingStatus = bookingStatuses.find(
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

const formatBookingDate = (dateValue) => {
  if (!dateValue) {
    return "Not provided";
  }

  const date = new Date(
    `${dateValue}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat(
    "en-ZA",
    {
      dateStyle: "long"
    }
  ).format(date);
};

const openBookingDetails = async (booking) => {
  if (booking?.id && booking.viewedByAdmin !== true) {
    try {
      await updateDoc(doc(db, "pestBookings", booking.id), {
        viewedByAdmin: true,
        viewedAt: serverTimestamp()
      });

      booking.viewedByAdmin = true;
    } catch (error) {
      console.error("Unable to mark item as viewed:", error);
    }
  }

  selectedBooking.value = {
    ...booking
  };

  message.value = "";
  messageType.value = "";
};

const closeBookingDetails = () => {
  selectedBooking.value = null;
};

const updateBookingStatus = async (
  booking,
  newStatus
) => {
  if (!booking?.id || !newStatus) {
    return;
  }

  isUpdating.value = true;
  message.value = "";
  messageType.value = "";

  try {
    await updateDoc(
      doc(db, "pestBookings", booking.id),
      {
        status: newStatus,
        updatedAt: serverTimestamp()
      }
    );

    const bookingIndex =
      bookings.value.findIndex(
        (item) => item.id === booking.id
      );

    if (bookingIndex !== -1) {
      bookings.value[bookingIndex].status =
        newStatus;
    }

    if (
      selectedBooking.value?.id ===
      booking.id
    ) {
      selectedBooking.value.status =
        newStatus;
    }

    message.value =
      "Booking status updated successfully.";

    messageType.value = "success";
  } catch (error) {
    console.error(
      "Unable to update booking status:",
      error
    );

    message.value =
      "The booking status could not be updated.";

    messageType.value = "error";
  } finally {
    isUpdating.value = false;
  }
};

const removeBooking = async (booking) => {
  if (!booking?.id) {
    return;
  }

  const customerName =
    booking.name || "this customer";

  const confirmed = window.confirm(
    `Delete the pest-control booking for ${customerName}? This action cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  deletingBookingId.value = booking.id;
  message.value = "";
  messageType.value = "";

  try {
    await deleteDoc(
      doc(db, "pestBookings", booking.id)
    );

    bookings.value =
      bookings.value.filter(
        (item) => item.id !== booking.id
      );

    if (
      selectedBooking.value?.id ===
      booking.id
    ) {
      closeBookingDetails();
    }

    message.value =
      "The pest-control booking was deleted.";

    messageType.value = "success";
  } catch (error) {
    console.error(
      "Unable to delete pest booking:",
      error
    );

    message.value =
      "The booking could not be deleted.";

    messageType.value = "error";
  } finally {
    deletingBookingId.value = "";
  }
};

const callCustomer = (contact) => {
  if (!contact) {
    return "#";
  }

  const cleanedContact = contact.replace(
    /[^\d+]/g,
    ""
  );

  return `tel:${cleanedContact}`;
};

const whatsappCustomer = (contact) => {
  if (!contact) {
    return "#";
  }

  let cleanedContact = contact.replace(
    /\D/g,
    ""
  );

  if (cleanedContact.startsWith("0")) {
    cleanedContact =
      `27${cleanedContact.slice(1)}`;
  }

  const message =
    "Hello, this is RMC Group regarding your pest-control booking request.";

  return `https://wa.me/${cleanedContact}?text=${encodeURIComponent(
    message
  )}`;
};

onMounted(() => {
  loadBookings();
});
</script>

<template>
  <div class="admin-page">
    <header class="page-header">
      <div>
        <span class="page-label">
          Pest Control Management
        </span>

        <h1>Pest-control bookings</h1>

        <p>
          View, manage and update customer
          pest-control booking requests.
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
          @click="loadBookings"
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
        <span>Total bookings</span>

        <strong>
          {{ bookings.length }}
        </strong>
      </article>

      <article class="summary-card">
        <span>New requests</span>

        <strong>
          {{
            bookings.filter(
              (booking) =>
                !booking.status ||
                booking.status === "new"
            ).length
          }}
        </strong>
      </article>

      <article class="summary-card">
        <span>Confirmed</span>

        <strong>
          {{
            bookings.filter(
              (booking) =>
                booking.status === "confirmed"
            ).length
          }}
        </strong>
      </article>

      <article class="summary-card">
        <span>Completed</span>

        <strong>
          {{
            bookings.filter(
              (booking) =>
                booking.status === "completed"
            ).length
          }}
        </strong>
      </article>
    </section>

    <section class="filter-panel">
      <div class="filter-group search-group">
        <label for="booking-search">
          Search bookings
        </label>

        <input
          id="booking-search"
          v-model="searchTerm"
          type="search"
          placeholder="Search name, phone, address or reference"
        />
      </div>

      <div class="filter-group">
        <label for="status-filter">
          Filter by status
        </label>

        <select
          id="status-filter"
          v-model="statusFilter"
        >
          <option value="all">
            All statuses
          </option>

          <option
            v-for="status in bookingStatuses"
            :key="status.value"
            :value="status.value"
          >
            {{ status.label }}
          </option>
        </select>
      </div>
    </section>

    <section class="bookings-panel">
      <div
        v-if="isLoading"
        class="empty-state"
      >
        Loading pest-control bookings...
      </div>

      <div
        v-else-if="filteredBookings.length === 0"
        class="empty-state"
      >
        No pest-control bookings were found.
      </div>

      <div
        v-else
        class="table-wrapper"
      >
        <table class="bookings-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Appointment</th>
              <th>Contact</th>
              <th>Reference</th>
              <th>Status</th>
              <th class="actions-column">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="booking in filteredBookings"
              :key="booking.id"
            >
              <td>
                <strong>
                  {{ booking.name || "Not provided" }}
                </strong>

                <small>
                  {{ booking.address || "No address" }}
                </small>
              </td>

              <td>
                <strong>
                  {{
                    formatBookingDate(
                      booking.bookingDate
                    )
                  }}
                </strong>

                <small>
                  {{ booking.bookingTime || "No time" }}
                </small>
              </td>

              <td>
                <a
                  v-if="booking.contact || booking.phone"
                  :href="
                    callCustomer(
                      booking.contact ||
                      booking.phone
                    )
                  "
                  class="contact-link"
                >
                  {{
                    booking.contact ||
                    booking.phone
                  }}
                </a>

                <span v-else>
                  Not provided
                </span>
              </td>

              <td>
                <code>
                  {{
                    booking.bookingReference ||
                    "No reference"
                  }}
                </code>
              </td>

              <td>
                <span
                  :class="[
                    'status-badge',
                    getStatusClass(
                      booking.status
                    )
                  ]"
                >
                  {{
                    getStatusLabel(
                      booking.status
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
                      openBookingDetails(
                        booking
                      )
                    "
                  >
                    View
                  </button>

                  <button
                    type="button"
                    class="delete-button"
                    :disabled="
                      deletingBookingId ===
                      booking.id
                    "
                    @click="
                      removeBooking(booking)
                    "
                  >
                    {{
                      deletingBookingId ===
                      booking.id
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
      v-if="selectedBooking"
      class="modal-overlay"
      @click.self="closeBookingDetails"
    >
      <section class="booking-modal">
        <header class="modal-header">
          <div>
            <span class="page-label">
              Booking Details
            </span>

            <h2>
              {{ selectedBooking.name }}
            </h2>
          </div>

          <button
            type="button"
            class="close-button"
            aria-label="Close booking details"
            @click="closeBookingDetails"
          >
            ×
          </button>
        </header>

        <div class="details-grid">
          <div class="detail-item">
            <span>Booking reference</span>

            <strong>
              {{
                selectedBooking.bookingReference ||
                "Not available"
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Current status</span>

            <strong>
              {{
                getStatusLabel(
                  selectedBooking.status
                )
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Customer name</span>

            <strong>
              {{
                selectedBooking.name ||
                "Not provided"
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Contact number</span>

            <strong>
              {{
                selectedBooking.contact ||
                selectedBooking.phone ||
                "Not provided"
              }}
            </strong>
          </div>

          <div class="detail-item full-width">
            <span>Service address</span>

            <strong>
              {{
                selectedBooking.address ||
                "Not provided"
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Preferred date</span>

            <strong>
              {{
                formatBookingDate(
                  selectedBooking.bookingDate
                )
              }}
            </strong>
          </div>

          <div class="detail-item">
            <span>Preferred time</span>

            <strong>
              {{
                selectedBooking.bookingTime ||
                "Not provided"
              }}
            </strong>
          </div>

          <div class="detail-item full-width">
            <span>Submitted</span>

            <strong>
              {{
                formatCreatedDate(
                  selectedBooking.createdAt
                )
              }}
            </strong>
          </div>
        </div>

        <div class="status-control">
          <label for="booking-status">
            Change booking status
          </label>

          <select
            id="booking-status"
            :value="
              selectedBooking.status || 'new'
            "
            :disabled="isUpdating"
            @change="
              updateBookingStatus(
                selectedBooking,
                $event.target.value
              )
            "
          >
            <option
              v-for="status in bookingStatuses"
              :key="status.value"
              :value="status.value"
            >
              {{ status.label }}
            </option>
          </select>
        </div>

        <div class="modal-actions">
          <a
            :href="
              callCustomer(
                selectedBooking.contact ||
                selectedBooking.phone
              )
            "
            class="secondary-button"
          >
            Call Customer
          </a>

          <a
            :href="
              whatsappCustomer(
                selectedBooking.contact ||
                selectedBooking.phone
              )
            "
            class="whatsapp-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp Customer
          </a>

          <button
            type="button"
            class="delete-button"
            :disabled="
              deletingBookingId ===
              selectedBooking.id
            "
            @click="
              removeBooking(
                selectedBooking
              )
            "
          >
            Delete Booking
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
.delete-button,
.whatsapp-button {
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

.whatsapp-button {
  color: #ffffff;
  background: #16a34a;
  border: none;
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
  grid-template-columns: 1fr 240px;
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

.bookings-panel {
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.table-wrapper {
  overflow-x: auto;
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
}

.bookings-table th,
.bookings-table td {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: middle;
}

.bookings-table th {
  color: #475569;
  background: #f8fafc;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.bookings-table td strong,
.bookings-table td small {
  display: block;
}

.bookings-table td small {
  max-width: 260px;
  margin-top: 5px;
  color: #64748b;
}

.bookings-table code {
  color: #1e3a8a;
  overflow-wrap: anywhere;
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

.status-confirmed {
  color: #166534;
  background: #dcfce7;
}

.status-completed {
  color: #155e75;
  background: #cffafe;
}

.status-cancelled {
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

.booking-modal {
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

  .modal-actions > * {
    width: 100%;
  }
}

@media (max-width: 520px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .booking-modal {
    padding: 22px 17px;
  }
}
</style>