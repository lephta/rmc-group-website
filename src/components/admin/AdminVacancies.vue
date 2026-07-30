<script setup>
import {
  computed,
  onMounted,
  ref
} from "vue";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc
} from "firebase/firestore";

import { db } from "../../firebase";

const vacancies = ref([]);
const searchTerm = ref("");

const isLoading = ref(true);
const isSaving = ref(false);

const message = ref("");
const messageType = ref("");

const showForm = ref(false);
const editingId = ref(null);

const form = ref({
  title: "",
  location: "",
  type: "",
  department: "",
  description: "",
  closingDate: "",
  status: "open"
});

/* =========================
   FILTER VACANCIES
========================= */

const filteredVacancies = computed(() => {
  const search = searchTerm.value
    .trim()
    .toLowerCase();

  if (!search) {
    return vacancies.value;
  }

  return vacancies.value.filter((vacancy) => {
    const searchableValues = [
      vacancy.title,
      vacancy.location,
      vacancy.type,
      vacancy.department,
      vacancy.status
    ];

    return searchableValues.some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(search)
    );
  });
});

/* =========================
   DATE HELPERS
========================= */

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

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
};

const dateForInput = (value) => {
  const date = getDateValue(value);

  if (!date) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const isVacancyExpired = (vacancy) => {
  const closingDate = getDateValue(
    vacancy.closingDate
  );

  if (!closingDate) {
    return false;
  }

  const endOfClosingDate = new Date(
    closingDate
  );

  endOfClosingDate.setHours(
    23,
    59,
    59,
    999
  );

  return endOfClosingDate < new Date();
};

const getDisplayStatus = (vacancy) => {
  if (vacancy.status === "closed") {
    return "Closed";
  }

  if (isVacancyExpired(vacancy)) {
    return "Expired";
  }

  return "Open";
};

const getStatusClass = (vacancy) => {
  if (vacancy.status === "closed") {
    return "closed";
  }

  if (isVacancyExpired(vacancy)) {
    return "expired";
  }

  return "open";
};

/* =========================
   FORM HELPERS
========================= */

const resetForm = () => {
  form.value = {
    title: "",
    location: "",
    type: "",
    department: "",
    description: "",
    closingDate: "",
    status: "open"
  };

  editingId.value = null;
  showForm.value = false;
};

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

/* =========================
   LOAD VACANCIES
========================= */

const loadVacancies = async () => {
  isLoading.value = true;

  try {
    const vacanciesQuery = query(
      collection(db, "vacancies"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(
      vacanciesQuery
    );

    vacancies.value = snapshot.docs.map(
      (vacancyDoc) => ({
        id: vacancyDoc.id,
        ...vacancyDoc.data()
      })
    );
  } catch (error) {
    console.error(
      "Load vacancies error:",
      error
    );

    showFeedback(
      "Vacancies could not be loaded.",
      "error"
    );
  } finally {
    isLoading.value = false;
  }
};

/* =========================
   OPEN FORMS
========================= */

const openCreateForm = () => {
  resetForm();
  showForm.value = true;
};

const openEditForm = (vacancy) => {
  editingId.value = vacancy.id;

  form.value = {
    title: vacancy.title || "",
    location: vacancy.location || "",
    type: vacancy.type || "",
    department: vacancy.department || "",
    description: vacancy.description || "",
    closingDate: dateForInput(
      vacancy.closingDate
    ),
    status: vacancy.status || "open"
  };

  showForm.value = true;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

/* =========================
   SAVE VACANCY
========================= */

const saveVacancy = async () => {
  if (isSaving.value) {
    return;
  }

  if (
    !form.value.title.trim() ||
    !form.value.location.trim() ||
    !form.value.type.trim()
  ) {
    showFeedback(
      "Please complete the title, location and employment type.",
      "error"
    );

    return;
  }

  isSaving.value = true;

  const vacancyData = {
    title: form.value.title.trim(),
    location: form.value.location.trim(),
    type: form.value.type.trim(),
    department:
      form.value.department.trim(),
    description:
      form.value.description.trim(),

    closingDate: form.value.closingDate
      ? Timestamp.fromDate(
          new Date(
            `${form.value.closingDate}T12:00:00`
          )
        )
      : null,

    status: form.value.status
  };

  try {
    if (editingId.value) {
      await updateDoc(
        doc(
          db,
          "vacancies",
          editingId.value
        ),
        {
          ...vacancyData,
          updatedAt: serverTimestamp()
        }
      );

      showFeedback(
        "Vacancy updated successfully."
      );
    } else {
      await addDoc(
        collection(db, "vacancies"),
        {
          ...vacancyData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      );

      showFeedback(
        "Vacancy added successfully."
      );
    }

    resetForm();
    await loadVacancies();
  } catch (error) {
    console.error(
      "Save vacancy error:",
      error
    );

    showFeedback(
      "The vacancy could not be saved.",
      "error"
    );
  } finally {
    isSaving.value = false;
  }
};

/* =========================
   DELETE VACANCY
========================= */

const removeVacancy = async (vacancy) => {
  const confirmed = window.confirm(
    `Delete "${vacancy.title}"? This cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteDoc(
      doc(
        db,
        "vacancies",
        vacancy.id
      )
    );

    vacancies.value =
      vacancies.value.filter(
        (item) => item.id !== vacancy.id
      );

    showFeedback(
      "Vacancy deleted successfully."
    );
  } catch (error) {
    console.error(
      "Delete vacancy error:",
      error
    );

    showFeedback(
      "The vacancy could not be deleted.",
      "error"
    );
  }
};

/* =========================
   CHANGE STATUS
========================= */

const toggleStatus = async (vacancy) => {
  const newStatus =
    vacancy.status === "closed"
      ? "open"
      : "closed";

  try {
    await updateDoc(
      doc(
        db,
        "vacancies",
        vacancy.id
      ),
      {
        status: newStatus,
        updatedAt: serverTimestamp()
      }
    );

    vacancy.status = newStatus;

    showFeedback(
      `Vacancy marked as ${newStatus}.`
    );
  } catch (error) {
    console.error(
      "Status update error:",
      error
    );

    showFeedback(
      "The vacancy status could not be changed.",
      "error"
    );
  }
};

onMounted(loadVacancies);
</script>

<template>
  <section class="vacancies-page">
    <!-- PAGE HEADER -->
  <header class="page-header">
  <div class="page-header-content">
    <router-link
      to="/admin/dashboard"
      class="back-dashboard-button"
    >
      ← Back to Dashboard
    </router-link>

    <div>
      <span class="page-label">
        Recruitment management
      </span>

      <h1>Vacancies</h1>

      <p>
        Add, edit, close and remove job vacancies
        published on the RMC Group website.
      </p>
    </div>
  </div>

  <button
    class="primary-button"
    type="button"
    @click="openCreateForm"
  >
    + Add vacancy
  </button>
</header>

    <!-- FEEDBACK -->
    <div
      v-if="message"
      class="feedback-message"
      :class="messageType"
    >
      {{ message }}
    </div>

    <!-- VACANCY FORM -->
    <section
      v-if="showForm"
      class="vacancy-form-panel"
    >
      <div class="form-heading">
        <div>
          <span class="page-label">
            {{
              editingId
                ? "Edit vacancy"
                : "Create vacancy"
            }}
          </span>

          <h2>
            {{
              editingId
                ? "Update vacancy information"
                : "Publish a new vacancy"
            }}
          </h2>
        </div>

        <button
          class="close-button"
          type="button"
          aria-label="Close vacancy form"
          @click="resetForm"
        >
          ×
        </button>
      </div>

      <form
        class="vacancy-form"
        @submit.prevent="saveVacancy"
      >
        <div class="form-grid">
          <!-- JOB TITLE -->
          <div class="form-group">
            <label for="vacancy-title">
              Job title
            </label>

            <input
              id="vacancy-title"
              v-model="form.title"
              type="text"
              placeholder="Example: Frontend Developer"
              required
            />
          </div>

          <!-- LOCATION -->
          <div class="form-group">
            <label for="vacancy-location">
              Location
            </label>

            <input
              id="vacancy-location"
              v-model="form.location"
              type="text"
              placeholder="Example: Johannesburg"
              required
            />
          </div>

          <!-- EMPLOYMENT TYPE -->
          <div class="form-group">
            <label for="vacancy-type">
              Employment type
            </label>

            <select
              id="vacancy-type"
              v-model="form.type"
              required
            >
              <option value="" disabled>
                Select employment type
              </option>

              <option value="Permanent">
                Permanent
              </option>

              <option value="Temporary">
                Temporary
              </option>

              <option value="Contract">
                Contract
              </option>

              <option value="Part-time">
                Part-time
              </option>

              <option value="Internship">
                Internship
              </option>
            </select>
          </div>

          <!-- DEPARTMENT -->
          <div class="form-group">
            <label for="vacancy-department">
              Department
            </label>

            <input
              id="vacancy-department"
              v-model="form.department"
              type="text"
              placeholder="Example: Information Technology"
            />
          </div>

          <!-- CLOSING DATE -->
          <div class="form-group">
            <label for="vacancy-closing-date">
              Closing date
            </label>

            <input
              id="vacancy-closing-date"
              v-model="form.closingDate"
              type="date"
            />
          </div>

          <!-- STATUS -->
          <div class="form-group">
            <label for="vacancy-status">
              Status
            </label>

            <select
              id="vacancy-status"
              v-model="form.status"
            >
              <option value="open">
                Open
              </option>

              <option value="closed">
                Closed
              </option>
            </select>
          </div>

          <!-- DESCRIPTION -->
          <div class="form-group full-width">
            <label for="vacancy-description">
              Job description
            </label>

            <textarea
              id="vacancy-description"
              v-model="form.description"
              rows="7"
              placeholder="Describe the role, responsibilities, requirements and qualifications."
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button
            class="secondary-button"
            type="button"
            @click="resetForm"
          >
            Cancel
          </button>

          <button
            class="primary-button"
            type="submit"
            :disabled="isSaving"
          >
            {{
              isSaving
                ? "Saving..."
                : editingId
                  ? "Update vacancy"
                  : "Publish vacancy"
            }}
          </button>
        </div>
      </form>
    </section>

    <!-- VACANCIES TABLE -->
    <section class="vacancy-list-panel">
      <div class="list-toolbar">
        <div>
          <h2>All vacancies</h2>

          <p>
            {{ filteredVacancies.length }}
            vacancy or vacancies found
          </p>
        </div>

        <input
          v-model="searchTerm"
          class="search-input"
          type="search"
          placeholder="Search vacancies..."
        />
      </div>

      <!-- LOADING -->
      <div
        v-if="isLoading"
        class="empty-state"
      >
        Loading vacancies...
      </div>

      <!-- EMPTY -->
      <div
        v-else-if="
          filteredVacancies.length === 0
        "
        class="empty-state"
      >
        No vacancies were found.
      </div>

      <!-- TABLE -->
      <div
        v-else
        class="table-wrapper"
      >
        <table class="vacancy-table">
          <thead>
            <tr>
              <th>Job title</th>
              <th>Location</th>
              <th>Type</th>
              <th>Department</th>
              <th>Closing date</th>
              <th>Status</th>
              <th>Created</th>

              <th class="actions-column">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="vacancy in filteredVacancies"
              :key="vacancy.id"
            >
              <td>
                <strong>
                  {{ vacancy.title }}
                </strong>
              </td>

              <td>
                {{ vacancy.location || "—" }}
              </td>

              <td>
                {{ vacancy.type || "—" }}
              </td>

              <td>
                {{ vacancy.department || "—" }}
              </td>

              <td>
                {{
                  vacancy.closingDate
                    ? formatDate(
                        vacancy.closingDate
                      )
                    : "No closing date"
                }}
              </td>

              <td>
                <button
                  class="status-badge"
                  :class="
                    getStatusClass(vacancy)
                  "
                  type="button"
                  :title="
                    vacancy.status === 'closed'
                      ? 'Click to reopen'
                      : 'Click to close'
                  "
                  @click="
                    toggleStatus(vacancy)
                  "
                >
                  {{
                    getDisplayStatus(vacancy)
                  }}
                </button>
              </td>

              <td>
                {{
                  formatDate(
                    vacancy.createdAt
                  )
                }}
              </td>

              <td>
                <div class="row-actions">
                  <button
                    class="edit-button"
                    type="button"
                    @click="
                      openEditForm(vacancy)
                    "
                  >
                    Edit
                  </button>

                  <button
                    class="delete-button"
                    type="button"
                    @click="
                      removeVacancy(vacancy)
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
  </section>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.vacancies-page {
  min-height: 100vh;
  padding: 42px;
  color: #1e293b;
  background: #f1f5f9;
  font-family: "Segoe UI", Arial, sans-serif;
}

/* =========================
   PAGE HEADER
========================= */

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 28px;
}

.page-label {
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.page-header h1,
.form-heading h2 {
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
.list-toolbar p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}

/* =========================
   BUTTONS
========================= */

.primary-button,
.secondary-button,
.edit-button,
.delete-button,
.close-button,
.status-badge {
  cursor: pointer;
  font: inherit;
}

.primary-button {
  padding: 13px 20px;
  color: #ffffff;
  background: #2563eb;
  border: none;
  border-radius: 9px;
  font-weight: 750;
}

.primary-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.secondary-button {
  padding: 12px 19px;
  color: #334155;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  font-weight: 700;
}

/* =========================
   FEEDBACK
========================= */

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

/* =========================
   PANELS
========================= */

.vacancy-form-panel,
.vacancy-list-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 15px;
  box-shadow:
    0 8px 24px
    rgba(15, 23, 42, 0.05);
}

.vacancy-form-panel {
  margin-bottom: 28px;
  padding: 28px;
}

.form-heading,
.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
}

.form-heading {
  margin-bottom: 24px;
}

.close-button {
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

/* =========================
   FORM
========================= */

.form-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  color: #334155;
  font-size: 0.9rem;
  font-weight: 700;
}

.form-group input,
.form-group select,
.form-group textarea,
.search-input {
  width: 100%;
  padding: 13px;
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  font: inherit;
}

.form-group textarea {
  resize: vertical;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus,
.search-input:focus {
  border-color: #2563eb;
  outline: 3px solid
    rgba(37, 99, 235, 0.12);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* =========================
   LIST TOOLBAR
========================= */

.vacancy-list-panel {
  overflow: hidden;
}

.list-toolbar {
  padding: 24px 28px;
  border-bottom: 1px solid #e2e8f0;
}

.list-toolbar h2 {
  margin: 0 0 5px;
  color: #0f172a;
}

.search-input {
  max-width: 320px;
}

/* =========================
   TABLE
========================= */

.table-wrapper {
  overflow-x: auto;
}

.vacancy-table {
  width: 100%;
  border-collapse: collapse;
}

.vacancy-table th,
.vacancy-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.vacancy-table th {
  color: #475569;
  background: #f8fafc;
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.vacancy-table tbody tr:hover {
  background: #f8fafc;
}

.actions-column {
  text-align: right;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.edit-button,
.delete-button {
  padding: 8px 12px;
  background: #ffffff;
  border-radius: 7px;
  font-weight: 700;
}

.edit-button {
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.edit-button:hover {
  background: #eff6ff;
}

.delete-button {
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.delete-button:hover {
  background: #fef2f2;
}

/* =========================
   STATUS BADGES
========================= */

.status-badge {
  padding: 6px 11px;
  border: none;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: capitalize;
}

.status-badge.open {
  color: #166534;
  background: #dcfce7;
}

.status-badge.closed {
  color: #991b1b;
  background: #fee2e2;
}

.status-badge.expired {
  color: #9a3412;
  background: #ffedd5;
}

/* =========================
   EMPTY STATE
========================= */

.empty-state {
  padding: 60px 25px;
  color: #64748b;
  text-align: center;
}

/* =========================
   MOBILE
========================= */

@media (max-width: 760px) {
  .vacancies-page {
    padding: 28px 18px;
  }

  .page-header,
  .list-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-button,
  .search-input {
    width: 100%;
    max-width: none;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full-width {
    grid-column: auto;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }
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
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 750;
  text-decoration: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.back-dashboard-button:hover {
  background: #dbeafe;
  border-color: #93c5fd;
  transform: translateX(-2px);
}
</style>