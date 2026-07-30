<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const route = useRoute();
const router = useRouter();

const vacancy = ref(null);
const loading = ref(true);
const errorMessage = ref("");

const loadVacancy = async () => {
  try {
    loading.value = true;
    errorMessage.value = "";

    const vacancyReference = doc(
      db,
      "vacancies",
      route.params.id
    );

    const vacancySnapshot = await getDoc(vacancyReference);

    if (!vacancySnapshot.exists()) {
      throw new Error("This vacancy could not be found.");
    }

    const vacancyData = vacancySnapshot.data();

    if (vacancyData.active !== true) {
      throw new Error("This vacancy is no longer available.");
    }

    vacancy.value = {
      id: vacancySnapshot.id,
      ...vacancyData
    };
  } catch (error) {
    console.error("Vacancy details error:", error);

    errorMessage.value =
      error.message || "The vacancy could not be loaded.";
  } finally {
    loading.value = false;
  }
};

const formatDate = (value) => {
  if (!value) {
    return "Not specified";
  }

  const date =
    typeof value.toDate === "function"
      ? value.toDate()
      : new Date(value);

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
};

const applyForVacancy = () => {
  router.push({
    path: "/recruitment",
    query: {
      vacancy: vacancy.value.id
    },
    hash: "#application-form"
  });
};

onMounted(loadVacancy);
</script>

<template>
  <div class="vacancy-details-page">
    <section class="details-header">
      <div class="details-header-content">
        <router-link
          to="/recruitment"
          class="back-link"
        >
          ← Back to Vacancies
        </router-link>

        <p class="header-label">RMC Group Careers</p>

        <h1>
          {{ vacancy?.title || "Vacancy Details" }}
        </h1>
      </div>
    </section>

    <main class="details-container">
      <p
        v-if="loading"
        class="state-message"
      >
        Loading vacancy details...
      </p>

      <div
        v-else-if="errorMessage"
        class="error-card"
      >
        <h2>Vacancy unavailable</h2>

        <p>{{ errorMessage }}</p>

        <router-link
          to="/recruitment"
          class="secondary-btn"
        >
          View Available Vacancies
        </router-link>
      </div>

      <article
        v-else-if="vacancy"
        class="vacancy-details-card"
      >
        <span class="status-badge">
          Open
        </span>

        <div class="vacancy-summary">
          <div>
            <span>Location</span>
            <strong>{{ vacancy.location }}</strong>
          </div>

          <div>
            <span>Employment type</span>
            <strong>{{ vacancy.type }}</strong>
          </div>

          <div>
            <span>Closing date</span>
            <strong>
              {{ formatDate(vacancy.closingDate) }}
            </strong>
          </div>
        </div>

        <section class="details-section">
          <h2>Job Description</h2>

          <p class="preserve-lines">
            {{ vacancy.description }}
          </p>
        </section>

        <section
          v-if="vacancy.responsibilities"
          class="details-section"
        >
          <h2>Responsibilities</h2>

          <p class="preserve-lines">
            {{ vacancy.responsibilities }}
          </p>
        </section>

        <section
          v-if="vacancy.requirements"
          class="details-section"
        >
          <h2>Minimum Requirements</h2>

          <p class="preserve-lines">
            {{ vacancy.requirements }}
          </p>
        </section>

        <section
          v-if="vacancy.qualifications"
          class="details-section"
        >
          <h2>Qualifications</h2>

          <p class="preserve-lines">
            {{ vacancy.qualifications }}
          </p>
        </section>

        <div class="action-area">
          <button
            type="button"
            class="apply-btn"
            @click="applyForVacancy"
          >
            Apply for This Vacancy
          </button>
        </div>
      </article>
    </main>
  </div>
</template>

<style scoped>
.vacancy-details-page {
  min-height: 100vh;
  background: #f6f7f9;
  color: #333;
  font-family: "Segoe UI", Arial, sans-serif;
}

.details-header {
  padding: 90px 20px 70px;
  background: linear-gradient(135deg, #007bff, #005ecb);
  color: #fff;
}

.details-header-content {
  max-width: 1000px;
  margin: 0 auto;
}

.back-link {
  display: inline-block;
  margin-bottom: 24px;
  color: #fff;
  text-decoration: none;
  font-weight: 700;
}

.back-link:hover {
  text-decoration: underline;
}

.header-label {
  margin: 0 0 10px;
  color: #dbeafe;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}

.details-header h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.4rem);
}

.details-container {
  max-width: 1000px;
  margin: -35px auto 0;
  padding: 0 20px 70px;
}

.vacancy-details-card,
.error-card {
  padding: 38px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.1);
}

.status-badge {
  display: inline-block;
  margin-bottom: 24px;
  padding: 7px 14px;
  background: #dcfce7;
  color: #166534;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
}

.vacancy-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 35px;
}

.vacancy-summary div {
  padding: 18px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.vacancy-summary span {
  display: block;
  margin-bottom: 7px;
  color: #6b7280;
  font-size: 0.85rem;
}

.vacancy-summary strong {
  color: #222;
}

.details-section {
  padding: 28px 0;
  border-top: 1px solid #e5e7eb;
}

.details-section h2 {
  margin: 0 0 14px;
  color: #007bff;
}

.details-section p {
  margin: 0;
  color: #555;
  line-height: 1.8;
}

.preserve-lines {
  white-space: pre-line;
}

.action-area {
  padding-top: 30px;
  border-top: 1px solid #e5e7eb;
}

.apply-btn,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 24px;
  background: #007bff;
  color: #fff;
  border: 0;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
  cursor: pointer;
}

.apply-btn:hover,
.secondary-btn:hover {
  background: #005ecb;
}

.state-message {
  padding: 40px;
  text-align: center;
}

.error-card {
  text-align: center;
}

.error-card p {
  margin-bottom: 24px;
}

@media (max-width: 700px) {
  .details-header {
    padding: 75px 20px 50px;
  }

  .details-container {
    margin-top: -20px;
  }

  .vacancy-details-card,
  .error-card {
    padding: 24px 18px;
  }

  .vacancy-summary {
    grid-template-columns: 1fr;
  }

  .apply-btn {
    width: 100%;
  }
}
</style>