<script setup>
import {
  Briefcase,
  Building2,
  CalendarDays,
  Home,
  Info,
  MapPin,
  Menu,
  Phone,
  Search,
  Star,
  Users,
  X
} from "lucide-vue-next";

import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref
} from "vue";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import { db } from "../firebase";

/* =========================
   MOBILE NAVIGATION
========================= */

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

/* =========================
   VACANCIES
========================= */

const vacancies = ref([]);
const vacanciesLoading = ref(true);
const vacanciesError = ref("");
const vacancySearch = ref("");

let stopVacanciesListener = null;

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
    return "";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
};

const isVacancyClosed = (vacancy) => {
  if (!vacancy) {
    return true;
  }

  // New dashboard status field
  if (vacancy.status === "closed") {
    return true;
  }

  // Backward compatibility
  if (vacancy.active === false) {
    return true;
  }

  const closingDate = getDateValue(vacancy.closingDate);

  if (!closingDate) {
    return false;
  }

  const endOfClosingDay = new Date(closingDate);

  endOfClosingDay.setHours(
    23,
    59,
    59,
    999
  );

  return endOfClosingDay < new Date();
};

const getDaysRemaining = (vacancy) => {
  const closingDate = getDateValue(
    vacancy?.closingDate
  );

  if (!closingDate) {
    return null;
  }

  const endOfClosingDay = new Date(
    closingDate
  );

  endOfClosingDay.setHours(
    23,
    59,
    59,
    999
  );

  const difference =
    endOfClosingDay.getTime() -
    new Date().getTime();

  return Math.ceil(
    difference /
      (1000 * 60 * 60 * 24)
  );
};

const isClosingSoon = (vacancy) => {
  const daysRemaining =
    getDaysRemaining(vacancy);

  if (daysRemaining === null) {
    return false;
  }

  return (
    daysRemaining >= 0 &&
    daysRemaining <= 7
  );
};

/* =========================
   COMPUTED VACANCIES
========================= */

const openVacancies = computed(() => {
  return vacancies.value.filter(
    (vacancy) =>
      !isVacancyClosed(vacancy)
  );
});

const filteredVacancies = computed(() => {
  const searchTerm =
    vacancySearch.value
      .trim()
      .toLowerCase();

  if (!searchTerm) {
    return openVacancies.value;
  }

  return openVacancies.value.filter(
    (vacancy) => {
      const searchableText = [
        vacancy.title,
        vacancy.location,
        vacancy.type,
        vacancy.description,
        vacancy.department
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        searchTerm
      );
    }
  );
});

/* =========================
   LOAD FIRESTORE VACANCIES
========================= */

const listenForVacancies = () => {
  vacanciesLoading.value = true;
  vacanciesError.value = "";

  stopVacanciesListener = onSnapshot(
    collection(db, "vacancies"),

    (snapshot) => {
      vacancies.value = snapshot.docs
        .map((document) => ({
          id: document.id,
          ...document.data()
        }))
        .sort((firstVacancy, secondVacancy) => {
          const firstDate = getDateValue(
            firstVacancy.createdAt
          );

          const secondDate = getDateValue(
            secondVacancy.createdAt
          );

          const firstTime =
            firstDate?.getTime() || 0;

          const secondTime =
            secondDate?.getTime() || 0;

          return secondTime - firstTime;
        });

      vacanciesLoading.value = false;
    },

    (error) => {
      console.error(
        "Vacancies could not be loaded:",
        error
      );

      vacanciesError.value =
        "Available vacancies could not be loaded. Please refresh the page and try again.";

      vacanciesLoading.value = false;
    }
  );
};

/* =========================
   PAGE LIFECYCLE
========================= */

onMounted(() => {
  listenForVacancies();
});

onBeforeUnmount(() => {
  if (stopVacanciesListener) {
    stopVacanciesListener();
  }
});
</script>

<template>
  <div class="recruitment-page">
    <!-- NAVIGATION -->
    <nav class="navbar">
      <div class="nav-container">
        <router-link
          to="/"
          class="nav-logo"
          @click="closeMenu"
        >
          <span class="logo-main">
            RMC
          </span>

          <span class="logo-small">
            Group
          </span>
        </router-link>

        <button
          type="button"
          class="menu-toggle"
          :aria-expanded="isMenuOpen"
          aria-label="Toggle navigation menu"
          @click="toggleMenu"
        >
          <X
            v-if="isMenuOpen"
            :size="27"
          />

          <Menu
            v-else
            :size="27"
          />
        </button>

        <div
          :class="[
            'nav-links',
            { active: isMenuOpen }
          ]"
        >
          <router-link
            to="/"
            @click="closeMenu"
          >
            <Home :size="18" />
            Home
          </router-link>

          <router-link
            to="/about"
            @click="closeMenu"
          >
            <Info :size="18" />
            About Us
          </router-link>

          <router-link
            to="/services"
            @click="closeMenu"
          >
            <Briefcase :size="18" />
            Services
          </router-link>

          <router-link
            to="/why-choose-us"
            @click="closeMenu"
          >
            <Star :size="18" />
            Why Choose Us
          </router-link>

          <router-link
            to="/contact"
            @click="closeMenu"
          >
            <Phone :size="18" />
            Contact Us
          </router-link>

          <router-link
            to="/directors"
            @click="closeMenu"
          >
            <Users :size="18" />
            Directors
          </router-link>
        </div>
      </div>
    </nav>

    <!-- HERO -->
    <header class="recruitment-hero">
      <div class="hero-overlay"></div>

      <div class="hero-content">
        <router-link
          to="/"
          class="back-link"
        >
          ← Back to Home
        </router-link>

        <span class="hero-label">
          RMC Recruitment
        </span>

        <h1>
          Connecting businesses with the right talent
        </h1>

        <p>
          Explore available employment opportunities and apply
          for a position that matches your skills and experience.
        </p>

        <a
          href="#available-vacancies"
          class="hero-button"
        >
          View Available Vacancies
        </a>
      </div>
    </header>

    <!-- INTRODUCTION -->
    <main>
      <section class="introduction-section">
        <div class="section-container introduction-grid">
          <article class="information-card">
            <div class="information-icon">
              <Users :size="30" />
            </div>

            <h2>
              About Our Recruitment Services
            </h2>

            <p>
              RMC Group helps organisations find dependable
              candidates across different industries. Our
              recruitment services support both employers and
              job seekers throughout the placement process.
            </p>
          </article>

          <article class="information-card">
            <div class="information-icon">
              <Briefcase :size="30" />
            </div>

            <h2>
              How to Apply
            </h2>

            <p>
              Review the vacancies displayed below. When you find
              a suitable position, select
              <strong>Apply for This Position</strong>. You will
              then be taken to the application page for that
              specific vacancy.
            </p>
          </article>

          <article class="information-card">
            <div class="information-icon">
              <Building2 :size="30" />
            </div>

            <h2>
              Recruitment Support
            </h2>

            <p>
              We provide candidate sourcing, screening, labour
              broking and placement support based on each
              organisation's employment requirements.
            </p>
          </article>
        </div>
      </section>

      <!-- AVAILABLE VACANCIES -->
      <section
        id="available-vacancies"
        class="vacancies-section"
      >
        <div class="section-container">
          <div class="section-heading">
            <span class="section-label">
              Career Opportunities
            </span>

            <h2>
              Available Vacancies
            </h2>

            <p>
              Search the current vacancies and select a position
              to continue to the application form.
            </p>
          </div>

          <!-- SEARCH -->
          <div
            v-if="
              !vacanciesLoading &&
              !vacanciesError &&
              openVacancies.length
            "
            class="search-wrapper"
          >
            <Search
              :size="21"
              class="search-icon"
            />

            <input
              v-model="vacancySearch"
              type="search"
              placeholder="Search by job title, location or employment type"
              aria-label="Search vacancies"
            />
          </div>

          <!-- LOADING -->
          <div
            v-if="vacanciesLoading"
            class="state-card"
          >
            <div class="loading-spinner"></div>

            <h3>
              Loading vacancies
            </h3>

            <p>
              Please wait while we retrieve the latest
              opportunities.
            </p>
          </div>

          <!-- ERROR -->
          <div
            v-else-if="vacanciesError"
            class="state-card error-state"
          >
            <h3>
              Vacancies unavailable
            </h3>

            <p>
              {{ vacanciesError }}
            </p>
          </div>

          <!-- VACANCY CARDS -->
          <div
            v-else-if="filteredVacancies.length"
            class="vacancies-grid"
          >
            <article
              v-for="vacancy in filteredVacancies"
              :key="vacancy.id"
              class="vacancy-card"
            >
              <div class="vacancy-card-header">
                <span class="vacancy-status">
                  Open
                </span>

                <span
                  v-if="isClosingSoon(vacancy)"
                  class="closing-soon"
                >
                  Closing soon
                </span>
              </div>

              <div class="vacancy-icon">
                <Briefcase :size="26" />
              </div>

              <h3>
                {{ vacancy.title }}
              </h3>

              <div class="vacancy-meta">
                <p v-if="vacancy.location">
                  <MapPin :size="18" />

                  <span>
                    {{ vacancy.location }}
                  </span>
                </p>

                <p v-if="vacancy.type">
                  <Briefcase :size="18" />

                  <span>
                    {{ vacancy.type }}
                  </span>
                </p>

                <p v-if="vacancy.closingDate">
                  <CalendarDays :size="18" />

                  <span>
                    Closes:
                    {{ formatDate(vacancy.closingDate) }}
                  </span>
                </p>
              </div>

              <p
                v-if="vacancy.description"
                class="vacancy-description"
              >
                {{ vacancy.description }}
              </p>

              <p
                v-else
                class="vacancy-description"
              >
                View this opportunity and submit your application
                through the RMC recruitment portal.
              </p>

              <router-link
                :to="{
                  path: '/recruitment-apply',
                  query: {
                    vacancy: vacancy.id
                  }
                }"
                class="apply-button"
              >
                Apply for This Position
              </router-link>
            </article>
          </div>

          <!-- NO SEARCH RESULTS -->
          <div
            v-else-if="
              openVacancies.length &&
              vacancySearch.trim()
            "
            class="state-card"
          >
            <Search :size="35" />

            <h3>
              No matching vacancies
            </h3>

            <p>
              No vacancy matches
              “{{ vacancySearch }}”. Try another job title,
              location or employment type.
            </p>

            <button
              type="button"
              class="clear-search-button"
              @click="vacancySearch = ''"
            >
              Clear Search
            </button>
          </div>

          <!-- NO VACANCIES -->
          <div
            v-else
            class="state-card"
          >
            <Briefcase :size="38" />

            <h3>
              No vacancies currently available
            </h3>

            <p>
              There are no open positions at the moment. Please
              check this page again for future opportunities.
            </p>
          </div>
        </div>
      </section>

      <!-- EMPLOYER CTA -->
      <section class="employer-section">
        <div class="employer-content">
          <div>
            <span class="section-label light-label">
              For Employers
            </span>

            <h2>
              Looking for suitable candidates?
            </h2>

            <p>
              Contact RMC Group to discuss recruitment, staffing
              or labour-broking requirements for your
              organisation.
            </p>
          </div>

          <router-link
            to="/contact"
            class="contact-button"
          >
            Contact RMC Group
          </router-link>
        </div>
      </section>
    </main>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-brand">
          <strong>
            RMC Group
          </strong>

          <p>
            Professional recruitment and business support
            solutions.
          </p>
        </div>

        <div class="footer-links">
          <router-link to="/">
            Home
          </router-link>

          <router-link to="/about">
            About Us
          </router-link>

          <router-link to="/services">
            Services
          </router-link>

          <router-link to="/contact">
            Contact Us
          </router-link>
        </div>
      </div>

      <div class="footer-bottom">
        <p>
          © 2026 Reatlegile Management Consulting Group.
          All rights reserved.
        </p>

        <p>
          Designed by
          <strong>TriSpark Digital</strong>
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.recruitment-page {
  min-height: 100vh;
  color: #1e293b;
  background: #ffffff;
  font-family: "Segoe UI", Arial, sans-serif;
}

.section-container {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
}

/* =========================
   NAVIGATION
========================= */

.navbar {
  position: relative;
  z-index: 1000;
  width: 100%;
  background: #0f172a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1180px, calc(100% - 40px));
  min-height: 78px;
  margin: 0 auto;
}

.nav-logo {
  display: flex;
  align-items: baseline;
  gap: 5px;
  color: #ffffff;
  text-decoration: none;
}

.logo-main {
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.06em;
}

.logo-small {
  color: #93c5fd;
  font-size: 0.86rem;
  font-weight: 700;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 23px;
}

.nav-links a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 0;
  color: #cbd5e1;
  font-size: 0.9rem;
  font-weight: 650;
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #ffffff;
}

.menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  padding: 5px;
  color: #ffffff;
  background: transparent;
  border: none;
  cursor: pointer;
}

/* =========================
   HERO
========================= */

.recruitment-hero {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 550px;
  padding: 85px 20px;
  overflow: hidden;
  color: #ffffff;
  background:
    linear-gradient(
      90deg,
      rgba(8, 20, 41, 0.95),
      rgba(8, 20, 41, 0.67)
    ),
    url("../assets/RMC-Recreuitment.jpeg")
      center / cover no-repeat;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 80% 30%,
    rgba(37, 99, 235, 0.28),
    transparent 35%
  );
}

.hero-content {
  position: relative;
  z-index: 2;
  width: min(1180px, 100%);
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  margin-bottom: 28px;
  color: #bfdbfe;
  font-weight: 650;
  text-decoration: none;
}

.back-link:hover {
  color: #ffffff;
}

.hero-label,
.section-label {
  display: block;
  margin-bottom: 13px;
  color: #2563eb;
  font-size: 0.79rem;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.hero-label {
  color: #93c5fd;
}

.hero-content h1 {
  max-width: 800px;
  margin: 0;
  font-size: clamp(2.8rem, 6vw, 5rem);
  line-height: 1.04;
  letter-spacing: -0.045em;
}

.hero-content p {
  max-width: 700px;
  margin: 25px 0 31px;
  color: #dbeafe;
  font-size: 1.08rem;
  line-height: 1.75;
}

.hero-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 49px;
  padding: 0 24px;
  color: #ffffff;
  background: #2563eb;
  border-radius: 8px;
  font-weight: 750;
  text-decoration: none;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.hero-button:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
}

/* =========================
   INTRODUCTION
========================= */

.introduction-section {
  padding: 85px 0;
  background: #ffffff;
}

.introduction-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 25px;
}

.information-card {
  padding: 31px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 15px 34px rgba(15, 23, 42, 0.07);
}

.information-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 57px;
  height: 57px;
  margin-bottom: 22px;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 12px;
}

.information-card h2 {
  margin: 0 0 14px;
  color: #0f172a;
  font-size: 1.3rem;
}

.information-card p {
  margin: 0;
  color: #64748b;
  line-height: 1.75;
}

/* =========================
   VACANCIES
========================= */

.vacancies-section {
  padding: 95px 0;
  scroll-margin-top: 25px;
  background: #f8fafc;
}

.section-heading {
  max-width: 750px;
  margin: 0 auto 42px;
  text-align: center;
}

.section-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2.15rem, 4vw, 3.3rem);
  line-height: 1.12;
  letter-spacing: -0.035em;
}

.section-heading p {
  margin: 18px 0 0;
  color: #64748b;
  font-size: 1rem;
  line-height: 1.7;
}

.search-wrapper {
  position: relative;
  max-width: 760px;
  margin: 0 auto 42px;
}

.search-wrapper input {
  width: 100%;
  height: 56px;
  padding: 0 20px 0 53px;
  color: #0f172a;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 11px;
  outline: none;
  font: inherit;
  box-shadow: 0 9px 25px rgba(15, 23, 42, 0.05);
}

.search-wrapper input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 19px;
  z-index: 2;
  color: #64748b;
  transform: translateY(-50%);
}

.vacancies-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 25px;
}

.vacancy-card {
  display: flex;
  flex-direction: column;
  padding: 28px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 15px;
  box-shadow: 0 13px 32px rgba(15, 23, 42, 0.07);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.vacancy-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 23px 45px rgba(15, 23, 42, 0.12);
  transform: translateY(-6px);
}

.vacancy-card-header {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: space-between;
  margin-bottom: 21px;
}

.vacancy-status,
.closing-soon {
  display: inline-flex;
  align-items: center;
  padding: 6px 11px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.vacancy-status {
  color: #166534;
  background: #dcfce7;
}

.closing-soon {
  color: #9a3412;
  background: #ffedd5;
}

.vacancy-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 51px;
  height: 51px;
  margin-bottom: 19px;
  color: #ffffff;
  background: #2563eb;
  border-radius: 11px;
}

.vacancy-card h3 {
  margin: 0 0 17px;
  color: #0f172a;
  font-size: 1.33rem;
  line-height: 1.3;
}

.vacancy-meta {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding-bottom: 19px;
  margin-bottom: 19px;
  border-bottom: 1px solid #e2e8f0;
}

.vacancy-meta p {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0;
  color: #475569;
  font-size: 0.89rem;
}

.vacancy-meta svg {
  flex-shrink: 0;
  color: #2563eb;
}

.vacancy-description {
  display: -webkit-box;
  margin: 0 0 24px;
  overflow: hidden;
  color: #64748b;
  line-height: 1.7;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.apply-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 47px;
  padding: 10px 18px;
  margin-top: auto;
  color: #ffffff;
  background: #2563eb;
  border-radius: 8px;
  font-weight: 750;
  text-align: center;
  text-decoration: none;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.apply-button:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
}

/* =========================
   PAGE STATES
========================= */

.state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 720px;
  padding: 50px 30px;
  margin: 0 auto;
  color: #64748b;
  text-align: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.state-card svg {
  margin-bottom: 18px;
  color: #2563eb;
}

.state-card h3 {
  margin: 0 0 11px;
  color: #0f172a;
  font-size: 1.35rem;
}

.state-card p {
  max-width: 550px;
  margin: 0;
  line-height: 1.7;
}

.error-state {
  background: #fff7f7;
  border-color: #fecaca;
}

.error-state h3 {
  color: #991b1b;
}

.clear-search-button {
  min-height: 43px;
  padding: 0 20px;
  margin-top: 22px;
  color: #ffffff;
  background: #2563eb;
  border: none;
  border-radius: 7px;
  font-weight: 700;
  cursor: pointer;
}

.loading-spinner {
  width: 39px;
  height: 39px;
  margin-bottom: 19px;
  border: 4px solid #dbeafe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: rotateSpinner 0.8s linear infinite;
}

@keyframes rotateSpinner {
  to {
    transform: rotate(360deg);
  }
}

/* =========================
   EMPLOYER CTA
========================= */

.employer-section {
  padding: 85px 20px;
  color: #ffffff;
  background:
    linear-gradient(
      120deg,
      #0f172a,
      #1e40af
    );
}

.employer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 45px;
  width: min(1100px, 100%);
  margin: 0 auto;
}

.light-label {
  color: #93c5fd;
}

.employer-content h2 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
}

.employer-content p {
  max-width: 700px;
  margin: 17px 0 0;
  color: #cbd5e1;
  line-height: 1.75;
}

.contact-button {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  padding: 0 24px;
  color: #0f172a;
  background: #ffffff;
  border-radius: 8px;
  font-weight: 750;
  text-decoration: none;
}

.contact-button:hover {
  background: #dbeafe;
}

/* =========================
   FOOTER
========================= */

.footer {
  padding: 55px 20px 24px;
  color: #94a3b8;
  background: #0b1120;
}

.footer-container {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  width: min(1180px, 100%);
  margin: 0 auto;
}

.footer-brand strong {
  color: #ffffff;
  font-size: 1.4rem;
}

.footer-brand p {
  max-width: 420px;
  line-height: 1.7;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
}

.footer-links a {
  color: #94a3b8;
  text-decoration: none;
}

.footer-links a:hover {
  color: #93c5fd;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  width: min(1180px, 100%);
  padding-top: 23px;
  margin: 42px auto 0;
  border-top: 1px solid #1e293b;
}

.footer-bottom p {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
}

.footer-bottom strong {
  color: #93c5fd;
}

/* =========================
   TABLET
========================= */

@media (max-width: 1000px) {
  .introduction-grid,
  .vacancies-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .nav-links {
    gap: 14px;
  }
}

/* =========================
   MOBILE NAVIGATION
========================= */

@media (max-width: 850px) {
  .menu-toggle {
    display: flex;
  }

  .nav-links {
    position: absolute;
    top: 78px;
    right: 0;
    left: 0;
    display: none;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 15px 20px 23px;
    background: #0f172a;
    border-top: 1px solid #1e293b;
  }

  .nav-links.active {
    display: flex;
  }

  .nav-links a {
    padding: 14px 5px;
    border-bottom: 1px solid #1e293b;
  }

  .employer-content {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* =========================
   SMALL MOBILE
========================= */

@media (max-width: 650px) {
  .section-container,
  .nav-container {
    width: min(100% - 30px, 1180px);
  }

  .recruitment-hero {
    min-height: 590px;
    padding: 70px 15px;
  }

  .hero-content h1 {
    font-size: 2.75rem;
  }

  .hero-button {
    width: 100%;
  }

  .introduction-section,
  .vacancies-section,
  .employer-section {
    padding-top: 65px;
    padding-bottom: 65px;
  }

  .introduction-grid,
  .vacancies-grid {
    grid-template-columns: 1fr;
  }

  .information-card,
  .vacancy-card {
    padding: 24px;
  }

  .employer-content {
    text-align: center;
  }

  .contact-button {
    width: 100%;
  }

  .footer-container,
  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }

  .footer-links {
    justify-content: center;
  }
}
</style>