<script setup>
import {
  onMounted,
  ref
} from "vue";

import {
  useRoute
} from "vue-router";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes
} from "firebase/storage";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

import {
  signInAnonymously
} from "firebase/auth";

import {
  AlertCircle,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle,
  Home,
  Info,
  LoaderCircle,
  MapPin,
  Menu,
  Phone,
  Send,
  Star,
  Users,
  X
} from "lucide-vue-next";

import {
  auth,
  db,
  storage
} from "../firebase";

const route = useRoute();

const isMenuOpen = ref(false);
const vacancyLoading = ref(true);
const vacancyError = ref("");
const isSubmitting = ref(false);
const statusMessage = ref("");
const submissionSuccessful = ref(false);
const selectedCv = ref(null);
const uploadProgressMessage = ref("");
const cvInput = ref(null);

const selectedVacancy = ref({
  id: "",
  title: "",
  location: "",
  type: "",
  department: "",
  description: "",
  closingDate: null
});

const createEmptyForm = () => ({
  fullName: "",
  email: "",
  phone: "",
  idNumber: "",
  location: "",
  experience: "",
  message: "",
  consent: false
});

const form = ref(createEmptyForm());

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
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
    return "";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
};

const vacancyIsClosed = (vacancy) => {
  if (vacancy.status === "closed") {
    return true;
  }

  const closingDate = getDateValue(
    vacancy.closingDate
  );

  if (!closingDate) {
    return false;
  }

  closingDate.setHours(
    23,
    59,
    59,
    999
  );

  return closingDate < new Date();
};

const loadSelectedVacancy = async () => {
  vacancyLoading.value = true;
  vacancyError.value = "";

  try {
    const vacancyId = String(
      route.query.vacancy || ""
    ).trim();

    if (!vacancyId) {
      throw new Error(
        "No vacancy was selected. Please return to the vacancies page and select a position."
      );
    }

    const vacancyReference = doc(
      db,
      "vacancies",
      vacancyId
    );

    const vacancySnapshot = await getDoc(
      vacancyReference
    );

    if (!vacancySnapshot.exists()) {
      throw new Error(
        "The selected vacancy could not be found."
      );
    }

    const vacancyData = {
      id: vacancySnapshot.id,
      ...vacancySnapshot.data()
    };

    if (vacancyIsClosed(vacancyData)) {
      throw new Error(
        "Applications for this vacancy are now closed."
      );
    }

    selectedVacancy.value = vacancyData;
  } catch (error) {
    console.error(
      "Selected vacancy could not be loaded:",
      error
    );

    vacancyError.value =
      error?.message ||
      "The selected vacancy could not be loaded.";
  } finally {
    vacancyLoading.value = false;
  }
};

const validateApplication = () => {
  if (!selectedVacancy.value.id) {
    throw new Error(
      "A valid vacancy has not been selected."
    );
  }

  if (form.value.fullName.length < 2) {
    throw new Error(
      "Please enter your full name."
    );
  }

  if (!form.value.email) {
    throw new Error(
      "Please enter your email address."
    );
  }

  if (!form.value.phone) {
    throw new Error(
      "Please enter your phone number."
    );
  }

  if (!form.value.location) {
    throw new Error(
      "Please enter your current location."
    );
  }

  if (form.value.message.length < 10) {
    throw new Error(
      "Please provide more information about your experience."
    );
  }

  if (!form.value.consent) {
    throw new Error(
      "Please accept the recruitment information consent."
    );
  }
};

const createApplicationReference = () => {
  const randomPart = Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase();

  return `RMC-APP-${Date.now()
    .toString()
    .slice(-6)}-${randomPart}`;
};

const submitApplication = async () => {
  statusMessage.value = "";
  submissionSuccessful.value = false;

  try {
    validateApplication();

    if (!selectedCv.value) {
      throw new Error(
        "Please select your CV before submitting."
      );
    }

    isSubmitting.value = true;

    let currentUser = auth.currentUser;

    if (!currentUser) {
      const credential =
        await signInAnonymously(auth);

      currentUser = credential.user;
    }

    const applicationReference =
      createApplicationReference();

    uploadProgressMessage.value =
      "Uploading CV...";

    const safeFileName = selectedCv.value.name
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    const cvStorageReference = storageRef(
      storage,
      `applications/${applicationReference}/${safeFileName}`
    );

    await uploadBytes(
      cvStorageReference,
      selectedCv.value
    );

    const cvUrl = await getDownloadURL(
      cvStorageReference
    );

    uploadProgressMessage.value =
      "Saving application...";

    await addDoc(
      collection(db, "applications"),
      {

        viewedByAdmin: false,
        applicationReference,
        applicantUid: currentUser.uid,
        vacancyId: selectedVacancy.value.id,
        vacancyTitle: selectedVacancy.value.title,
        vacancyLocation:
          selectedVacancy.value.location || "",
        vacancyType:
          selectedVacancy.value.type || "",
        fullName: form.value.fullName,
        email: form.value.email.toLowerCase(),
        phone: form.value.phone,
        cvUrl,
        cvFileName: selectedCv.value.name,
        idNumber: form.value.idNumber || null,
        applicantLocation: form.value.location,
        experience:
          form.value.experience || "Not specified",
        message: form.value.message,
        consent: form.value.consent,
        status: "new",
        source: "RMC recruitment website",
        createdAt: serverTimestamp()
      }
    );

    submissionSuccessful.value = true;

    statusMessage.value =
      `Thank you, ${form.value.fullName}. Your application for ${selectedVacancy.value.title} was submitted successfully. Your reference is ${applicationReference}.`;

    form.value = createEmptyForm();
    selectedCv.value = null;
    uploadProgressMessage.value = "";

    if (cvInput.value) {
      cvInput.value.value = "";
    }

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth"
    });
  } catch (error) {
    console.error(
      "Recruitment application failed:",
      error
    );

    if (error?.code === "storage/unauthorized") {
      statusMessage.value =
        "Firebase Storage blocked the CV upload. Please check your Storage rules.";
    } else if (error?.code === "permission-denied") {
      statusMessage.value =
        "Firebase blocked the application. Please check your Firestore rules.";
    } else if (
      error?.code === "auth/operation-not-allowed"
    ) {
      statusMessage.value =
        "Anonymous Authentication is not enabled in Firebase.";
    } else {
      statusMessage.value =
        error?.message ||
        "Your application could not be submitted. Please try again.";
    }
  } finally {
    isSubmitting.value = false;
    uploadProgressMessage.value = "";
  }
};

const handleCvSelection = (event) => {
  statusMessage.value = "";
  submissionSuccessful.value = false;

  const file = event.target.files?.[0];

  if (!file) {
    selectedCv.value = null;
    return;
  }

  const fileExtension = file.name
    .split(".")
    .pop()
    ?.toLowerCase();

  const allowedExtensions = [
    "pdf",
    "doc",
    "docx"
  ];

  const maximumSize = 5 * 1024 * 1024;

  if (!allowedExtensions.includes(fileExtension)) {
    selectedCv.value = null;
    event.target.value = "";

    statusMessage.value =
      "Please upload a PDF, DOC or DOCX file.";

    return;
  }

  if (file.size > maximumSize) {
    selectedCv.value = null;
    event.target.value = "";

    statusMessage.value =
      "The CV must be smaller than 5 MB.";

    return;
  }

  selectedCv.value = file;

  console.log("CV selected:", {
    name: file.name,
    size: file.size,
    type: file.type
  });
};

onMounted(() => {
  loadSelectedVacancy();
});
</script>

<template>
  <div class="application-page">
    <!-- NAVIGATION -->
    <nav class="navbar">
      <div class="navbar-inner">
        <router-link to="/" class="nav-logo">
          <span class="logo-main">RMC</span>
          <span class="logo-small">Group</span>
        </router-link>

        <button
          type="button"
          class="menu-toggle"
          aria-label="Toggle navigation menu"
          :aria-expanded="isMenuOpen"
          @click="toggleMenu"
        >
          <X v-if="isMenuOpen" :size="27" />
          <Menu v-else :size="27" />
        </button>

        <div :class="['nav-links', { active: isMenuOpen }]">
          <router-link to="/" @click="closeMenu">
            <Home :size="18" />
            Home
          </router-link>

          <router-link to="/about" @click="closeMenu">
            <Info :size="18" />
            About Us
          </router-link>

          <router-link to="/services" @click="closeMenu">
            <Briefcase :size="18" />
            Services
          </router-link>

          <router-link to="/why-choose-us" @click="closeMenu">
            <Star :size="18" />
            Why Choose Us
          </router-link>

          <router-link to="/contact" @click="closeMenu">
            <Phone :size="18" />
            Contact Us
          </router-link>

          <router-link to="/directors" @click="closeMenu">
            <Users :size="18" />
            Directors
          </router-link>
        </div>
      </div>
    </nav>

    <!-- HERO -->
    <header class="hero">
      <div class="hero-overlay"></div>

      <div class="hero-content">
        <router-link to="/recruitment" class="back-link">
          ← Back to Vacancies
        </router-link>

        <span class="hero-label">RMC Recruitment</span>

        <h1>Submit Your Application</h1>

        <p>
          Complete the application form below. Our recruitment team
          will review your information and contact shortlisted
          candidates.
        </p>
      </div>
    </header>

    <main class="main-content">
      <!-- VACANCY LOADING -->
      <section
        v-if="vacancyLoading"
        class="message-card"
      >
        <div class="loading-spinner"></div>

        <h2>Loading vacancy</h2>

        <p>
          Please wait while we retrieve the selected position.
        </p>
      </section>

      <!-- VACANCY ERROR -->
      <section
        v-else-if="vacancyError"
        class="message-card error-card"
      >
        <AlertCircle :size="42" />

        <h2>Vacancy unavailable</h2>

        <p>{{ vacancyError }}</p>

        <router-link
          to="/recruitment"
          class="primary-link"
        >
          View Available Vacancies
        </router-link>
      </section>

      <!-- APPLICATION CONTENT -->
      <div
        v-else
        class="application-layout"
      >
        <!-- VACANCY DETAILS -->
        <aside class="vacancy-summary">
          <span class="summary-label">
            Applying For
          </span>

          <h2>{{ selectedVacancy.title }}</h2>

          <div class="vacancy-details">
            <p v-if="selectedVacancy.location">
              <MapPin :size="19" />

              <span>
                {{ selectedVacancy.location }}
              </span>
            </p>

            <p v-if="selectedVacancy.type">
              <Briefcase :size="19" />

              <span>
                {{ selectedVacancy.type }}
              </span>
            </p>

            <p v-if="selectedVacancy.department">
              <Building2 :size="19" />

              <span>
                {{ selectedVacancy.department }}
              </span>
            </p>

            <p v-if="selectedVacancy.closingDate">
              <CalendarDays :size="19" />

              <span>
                Closing date:
                {{ formatDate(selectedVacancy.closingDate) }}
              </span>
            </p>
          </div>

          <p
            v-if="selectedVacancy.description"
            class="vacancy-description"
          >
            {{ selectedVacancy.description }}
          </p>

          <div class="summary-notice">
            <Info :size="20" />

            <p>
              Make sure your contact information is correct before
              submitting your application.
            </p>
          </div>
        </aside>

        <!-- APPLICATION FORM -->
        <section class="form-card">
          <div class="form-heading">
            <span class="form-label">
              Candidate Information
            </span>

            <h2>Application Form</h2>

            <p>
              Fields marked with an asterisk (*) are required.
            </p>
          </div>

          <form
            class="application-form"
            @submit.prevent="submitApplication"
          >
            <div class="form-group full-width">
              <label for="position">
                Position
              </label>

              <input
                id="position"
                :value="selectedVacancy.title"
                type="text"
                disabled
              />

              <small>
                This position was selected from the vacancies page.
              </small>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="fullName">
                  Full name *
                </label>

                <input
                  id="fullName"
                  v-model.trim="form.fullName"
                  type="text"
                  placeholder="Enter your full name"
                  autocomplete="name"
                  maxlength="100"
                  required
                />
              </div>

              <div class="form-group">
                <label for="email">
                  Email address *
                </label>

                <input
                  id="email"
                  v-model.trim="form.email"
                  type="email"
                  placeholder="Enter your email address"
                  autocomplete="email"
                  maxlength="150"
                  required
                />
              </div>

              <div class="form-group">
                <label for="phone">
                  Phone number *
                </label>

                <input
                  id="phone"
                  v-model.trim="form.phone"
                  type="tel"
                  placeholder="For example: 072 123 4567"
                  autocomplete="tel"
                  maxlength="20"
                  required
                />
              </div>

              <div class="form-group">
                <label for="idNumber">
                  ID or passport number
                </label>

                <input
                  id="idNumber"
                  v-model.trim="form.idNumber"
                  type="text"
                  placeholder="Enter ID or passport number"
                  maxlength="30"
                />
              </div>

              <div class="form-group">
                <label for="location">
                  Current location *
                </label>

                <input
                  id="location"
                  v-model.trim="form.location"
                  type="text"
                  placeholder="Town, city or province"
                  maxlength="100"
                  required
                />
              </div>

              <div class="form-group">
                <label for="experience">
                  Years of experience
                </label>

                <select
                  id="experience"
                  v-model="form.experience"
                >
                  <option value="">
                    Select experience
                  </option>

                  <option value="No experience">
                    No experience
                  </option>

                  <option value="Less than 1 year">
                    Less than 1 year
                  </option>

                  <option value="1–2 years">
                    1–2 years
                  </option>

                  <option value="3–5 years">
                    3–5 years
                  </option>

                  <option value="6–10 years">
                    6–10 years
                  </option>

                  <option value="More than 10 years">
                    More than 10 years
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group full-width">
              <label for="message">
                Experience and motivation *
              </label>

              <textarea
                id="message"
                v-model.trim="form.message"
                rows="7"
                placeholder="Tell us about your experience, skills and why you are interested in this position"
                maxlength="2000"
                required
              ></textarea>

              <small>
                {{ form.message.length }}/2000 characters
              </small>
            </div>
            <div class="form-group full-width">
  <label for="cv">
    Upload CV *
  </label>

<input
  ref="cvInput"
  id="cv"
  type="file"
  accept=".pdf,.doc,.docx"
  required
  @change="handleCvSelection"
/>

  <small v-if="selectedCv">
    Selected file: {{ selectedCv.name }}
  </small>

  <small v-else>
    PDF, DOC or DOCX only. Maximum file size: 5 MB.
  </small>
</div>

            <label class="consent-field">
              <input
                v-model="form.consent"
                type="checkbox"
                required
              />

              <span>
                I confirm that the information provided is accurate
                and I consent to RMC Group processing my information
                for recruitment purposes.
              </span>
            </label>

            <button
              type="submit"
              class="submit-button"
              :disabled="isSubmitting"
            >
              <LoaderCircle
                v-if="isSubmitting"
                :size="20"
                class="button-spinner"
              />

              <Send v-else :size="20" />

              {{
                isSubmitting
                  ? "Submitting Application..."
                  : "Submit Application"
              }}
            </button>

            <div
              v-if="statusMessage"
              :class="[
                'status-message',
                submissionSuccessful
                  ? 'success-message'
                  : 'error-message'
              ]"
            >
              <CheckCircle
                v-if="submissionSuccessful"
                :size="22"
              />

              <AlertCircle
                v-else
                :size="22"
              />

              <div>
                <strong>
                  {{
                    submissionSuccessful
                      ? "Application submitted"
                      : "Application not submitted"
                  }}
                </strong>

                <p>{{ statusMessage }}</p>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-container">
        <div>
          <strong class="footer-brand">
            RMC Group
          </strong>

          <p>
            Professional recruitment and business support solutions.
          </p>
        </div>

        <div class="footer-links">
          <router-link to="/">Home</router-link>
          <router-link to="/recruitment">Vacancies</router-link>
          <router-link to="/services">Services</router-link>
          <router-link to="/contact">Contact Us</router-link>
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

.application-page {
  min-height: 100vh;
  color: #1e293b;
  background: #f8fafc;
  font-family: "Segoe UI", Arial, sans-serif;
}

/* NAVIGATION */

.navbar {
  position: relative;
  z-index: 1000;
  width: 100%;
  background: #0f172a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.navbar-inner {
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

/* HERO */

.hero {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 390px;
  padding: 70px 20px;
  overflow: hidden;
  color: #ffffff;
  background:
    linear-gradient(
      90deg,
      rgba(8, 20, 41, 0.97),
      rgba(30, 64, 175, 0.78)
    );
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 80% 30%,
    rgba(147, 197, 253, 0.25),
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
  margin-bottom: 25px;
  color: #bfdbfe;
  font-weight: 700;
  text-decoration: none;
}

.back-link:hover {
  color: #ffffff;
}

.hero-label,
.summary-label,
.form-label {
  display: block;
  margin-bottom: 12px;
  color: #93c5fd;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.hero h1 {
  max-width: 780px;
  margin: 0;
  font-size: clamp(2.6rem, 5vw, 4.3rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.hero p {
  max-width: 680px;
  margin: 22px 0 0;
  color: #dbeafe;
  font-size: 1.05rem;
  line-height: 1.75;
}

/* MAIN CONTENT */

.main-content {
  width: min(1180px, calc(100% - 40px));
  padding: 70px 0 90px;
  margin: 0 auto;
}

.application-layout {
  display: grid;
  grid-template-columns: 0.72fr 1.28fr;
  gap: 28px;
  align-items: start;
}

.vacancy-summary,
.form-card,
.message-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
}

.vacancy-summary {
  position: sticky;
  top: 25px;
  padding: 30px;
}

.summary-label,
.form-label {
  color: #2563eb;
}

.vacancy-summary h2 {
  margin: 0 0 23px;
  color: #0f172a;
  font-size: 1.65rem;
  line-height: 1.3;
}

.vacancy-details {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.vacancy-details p {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  color: #475569;
  line-height: 1.55;
}

.vacancy-details svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #2563eb;
}

.vacancy-description {
  margin: 22px 0;
  color: #64748b;
  line-height: 1.75;
}

.summary-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  color: #1e40af;
  background: #eff6ff;
  border-radius: 10px;
}

.summary-notice svg {
  flex-shrink: 0;
}

.summary-notice p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* FORM */

.form-card {
  padding: 35px;
}

.form-heading {
  padding-bottom: 25px;
  margin-bottom: 28px;
  border-bottom: 1px solid #e2e8f0;
}

.form-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: 2rem;
}

.form-heading p {
  margin: 12px 0 0;
  color: #64748b;
}

.application-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.full-width {
  width: 100%;
}

.form-group label {
  color: #334155;
  font-size: 0.91rem;
  font-weight: 750;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 13px 14px;
  color: #0f172a;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  outline: none;
  font: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-group input,
.form-group select {
  min-height: 49px;
}

.form-group textarea {
  resize: vertical;
  line-height: 1.65;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.form-group input:disabled {
  color: #475569;
  background: #f1f5f9;
  cursor: not-allowed;
}

.form-group small {
  color: #64748b;
  font-size: 0.79rem;
}

.consent-field {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  line-height: 1.55;
}

.consent-field input {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: #2563eb;
}

.submit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 52px;
  padding: 12px 25px;
  color: #ffffff;
  background: #16a34a;
  border: none;
  border-radius: 9px;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background: #15803d;
  transform: translateY(-2px);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.button-spinner {
  animation: rotate 0.8s linear infinite;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

/* MESSAGES */

.status-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 17px;
  border-radius: 10px;
}

.status-message svg {
  flex-shrink: 0;
}

.status-message strong {
  display: block;
  margin-bottom: 5px;
}

.status-message p {
  margin: 0;
  line-height: 1.6;
}

.success-message {
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.error-message {
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.message-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 700px;
  padding: 55px 30px;
  margin: 0 auto;
  color: #64748b;
  text-align: center;
}

.message-card h2 {
  margin: 15px 0 10px;
  color: #0f172a;
}

.message-card p {
  max-width: 540px;
  margin: 0;
  line-height: 1.7;
}

.error-card svg {
  color: #dc2626;
}

.error-card h2 {
  color: #991b1b;
}

.primary-link {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  padding: 0 21px;
  margin-top: 25px;
  color: #ffffff;
  background: #2563eb;
  border-radius: 8px;
  font-weight: 750;
  text-decoration: none;
}

.loading-spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #dbeafe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: rotate 0.8s linear infinite;
}

/* FOOTER */

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

.footer-brand {
  color: #ffffff;
  font-size: 1.4rem;
}

.footer-container p {
  max-width: 430px;
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

/* RESPONSIVE */

@media (max-width: 900px) {
  .application-layout {
    grid-template-columns: 1fr;
  }

  .vacancy-summary {
    position: static;
  }

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
}

@media (max-width: 650px) {
  .navbar-inner,
  .main-content {
    width: min(100% - 30px, 1180px);
  }

  .hero {
    min-height: 430px;
    padding: 60px 15px;
  }

  .hero h1 {
    font-size: 2.55rem;
  }

  .main-content {
    padding-top: 45px;
    padding-bottom: 60px;
  }

  .form-card,
  .vacancy-summary {
    padding: 23px;
  }

  .form-grid {
    grid-template-columns: 1fr;
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