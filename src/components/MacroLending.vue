<script setup>
import { reactive, ref } from "vue";

import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

import { db, storage } from "../firebase";

const form = reactive({
  name: "",
  phone: "",
  email: "",
  amount: "",
  purpose: "",
  consent: false
});

const isSubmitting = ref(false);
const message = ref("");
const applicationSuccessful = ref(false);
const applicationReference = ref("");
const southAfricanIdFile = ref(null);
const bankStatementFile = ref(null);
const payslipFile = ref(null);


const handleIdUpload = (event) => {
  southAfricanIdFile.value = event.target.files?.[0] || null;
};

const handleBankStatementUpload = (event) => {
  bankStatementFile.value = event.target.files?.[0] || null;
};

const handlePayslipUpload = (event) => {
  payslipFile.value = event.target.files?.[0] || null;
};

const createApplicationReference = () => {
  return `LOAN-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;
};

const resetForm = () => {
  form.name = "";
  form.phone = "";
  form.email = "";
  form.amount = "";
  form.purpose = "";
  form.consent = false;
};

const validateForm = () => {
  const phonePattern = /^[0-9+\s()-]{9,20}$/;
  const maximumFileSize = 10 * 1024 * 1024;
  const uploadedFiles = [
    southAfricanIdFile.value,
    bankStatementFile.value,
    payslipFile.value
  ];

  for (const file of uploadedFiles) {
    if (file && file.size > maximumFileSize) {
      throw new Error(
        "Each document must be smaller than 10 MB."
      );
    }
  }

  if (!southAfricanIdFile.value) {
  throw new Error(
    "Please upload a copy of your South African ID."
  );
}

if (!bankStatementFile.value) {
  throw new Error(
    "Please upload your latest 3-month bank statement."
  );
}

if (!payslipFile.value) {
  throw new Error(
    "Please upload your 3 recent payslips."
  );
}

  if (!form.name.trim()) {
    throw new Error("Please enter your full name.");
  }

  if (!phonePattern.test(form.phone.trim())) {
    throw new Error("Please enter a valid contact number.");
  }

  if (!form.email.trim()) {
    throw new Error("Please enter your email address.");
  }

  const amount = Number(form.amount);

  if (!Number.isFinite(amount) || amount < 500 || amount > 10000) {
    throw new Error(
      "The requested loan amount must be between R500 and R10,000."
    );
  }

  if (!form.purpose.trim()) {
    throw new Error("Please explain the purpose of the loan.");
  }

  if (!form.consent) {
    throw new Error(
      "Please confirm that your information is correct."
    );
  }
};

const uploadLoanDocument = async (
  file,
  applicationReference,
  documentType
) => {
  const safeFileName = file.name.replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  );

  const documentReference = storageRef(
    storage,
    `loan-applications/${applicationReference}/${documentType}-${Date.now()}-${safeFileName}`
  );



  await uploadBytes(documentReference, file);

  return await getDownloadURL(documentReference);
};

const submitForm = async () => {
  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;
  message.value = "";
  applicationSuccessful.value = false;
  applicationReference.value = "";

  try {
    validateForm();

    message.value =
      "Uploading your documents and saving your application...";

    const reference = createApplicationReference();

    const [
      southAfricanIdUrl,
      bankStatementUrl,
      payslipUrl
    ] = await Promise.all([
      uploadLoanDocument(
        southAfricanIdFile.value,
        reference,
        "south-african-id"
      ),

      uploadLoanDocument(
        bankStatementFile.value,
        reference,
        "bank-statement"
      ),

      uploadLoanDocument(
        payslipFile.value,
        reference,
        "payslips"
      )
    ]);

    await addDoc(
      collection(db, "loanApplications"),
      {
        viewedByAdmin: false,
        applicationReference: reference,
        fullName: form.name.trim(),
        phoneNumber: form.phone.trim(),
        emailAddress: form.email.trim().toLowerCase(),
        requestedAmount: Number(form.amount),
        loanPurpose: form.purpose.trim(),
        consentProvided: form.consent,

        southAfricanIdUrl,
        southAfricanIdFileName:
          southAfricanIdFile.value.name,

        bankStatementUrl,
        bankStatementFileName:
          bankStatementFile.value.name,

        payslipUrl,
        payslipFileName:
          payslipFile.value.name,

        applicationStatus: "pending",
        createdAt: serverTimestamp()
      }
    );

    applicationReference.value = reference;
    applicationSuccessful.value = true;

    message.value =
      "Your loan application and supporting documents were submitted successfully. RMC Group will contact you after reviewing them.";

    resetForm();

    southAfricanIdFile.value = null;
    bankStatementFile.value = null;
    payslipFile.value = null;
  } catch (error) {
    console.error(
      "Loan application error:",
      error
    );

    applicationSuccessful.value = false;

    message.value =
      error?.message ||
      "Your application could not be submitted. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
};

</script>

<template>
  <div class="page-container">
    <nav class="page-navbar">
      <router-link to="/" class="nav-logo">
        RMC Group
      </router-link>

      <router-link to="/" class="nav-home">
        Home
      </router-link>
    </nav>

    <!-- HERO -->
    <section class="loan-hero">
      <div class="hero-content">
        <span class="hero-label">
          RMC Short-Term Loans
        </span>

        <h1>
          Financial support when you need it
        </h1>

        <p>
          Apply for a short-term loan through RMC Group. Our team will review
          your application and contact you regarding the next steps.
        </p>

        <a href="#loan-application" class="hero-button">
          Apply for a Loan
        </a>
      </div>
    </section>

    <!-- INTRODUCTION -->
    <section class="intro-section section-container">
      <div class="intro-content">
        <span class="section-label">
          Short-Term Lending
        </span>

        <h2>
          A simple and transparent application process
        </h2>

        <p>
          RMC Group provides short-term loan application services designed to
          assist qualifying customers with urgent financial needs.
        </p>

        <p>
          Completing the online form does not guarantee approval. Each
          application is assessed before the applicant receives an outcome.
        </p>
      </div>

      <img
        src="../assets/office5.jpeg"
        alt="RMC Group short-term loan services"
        class="intro-image"
      />
    </section>

    <!-- OUR OFFICE -->
     <section class="office-gallery section-container">
  <div class="section-heading">
    <span class="section-label">
      Our Offices
    </span>

    <h2>
      Visit RMC Group
    </h2>

    <p>
      We provide a welcoming and professional environment where our clients can receive financial guidance and personalised assistance.
    </p>
  </div>

  <div class="gallery-grid">
    <img src="../assets/office1.jpeg" alt="RMC Office 1" />
    <img src="../assets/office2.jpeg" alt="RMC Office 2" />
    <img src="../assets/office3.jpeg" alt="RMC Office 3" />
    <img src="../assets/office4.jpeg" alt="RMC Office 4" />
  
  </div>
</section>

    <!-- BENEFITS -->
    <section class="benefits-section">
      <div class="section-container">
        <div class="section-heading">
          <span class="section-label">
            Why Choose RMC?
          </span>

          <h2>
            A professional lending experience
          </h2>

          <p>
            We aim to make the application process clear, convenient and easy
            to understand.
          </p>
        </div>

        <div class="benefits-grid">
          <article class="benefit-card">
            <div class="benefit-icon">✓</div>

            <h3>Simple Application</h3>

            <p>
              Complete the application form online using your phone, tablet or
              computer.
            </p>
          </article>

          <article class="benefit-card">
            <div class="benefit-icon">✓</div>

            <h3>Clear Communication</h3>

            <p>
              Our team will contact you regarding the progress and outcome of
              your application.
            </p>
          </article>

          <article class="benefit-card">
            <div class="benefit-icon">✓</div>

            <h3>Transparent Process</h3>

            <p>
              Repayment terms and applicable costs will be explained before an
              agreement is finalised.
            </p>
          </article>

          <article class="benefit-card">
            <div class="benefit-icon">✓</div>

            <h3>Customer Support</h3>

            <p>
              Applicants can contact the RMC Group team if they need help with
              the application process.
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- ELIGIBILITY -->
    <section class="eligibility-section section-container">
      <div class="eligibility-content">
        <span class="section-label">
          Before You Apply
        </span>

        <h2>
          Information we need
        </h2>

        <p>
          RMC Group may request supporting documents during the assessment
          process.
        </p>

        <div class="requirements-list">
          <div class="requirement-item">
            <span>01</span>

            <div>
              <h3>Valid identification</h3>

              <p>
                A valid South African identity document or another accepted
                form of identification.
              </p>
            </div>
          </div>

          <div class="requirement-item">
            <span>02</span>

            <div>
              <h3>Proof of income</h3>

              <p>
                Recent payslips or other supporting evidence showing your
                source of income.
              </p>
            </div>
          </div>

          <div class="requirement-item">
            <span>03</span>

            <div>
              <h3>Bank statements</h3>

              <p>
                Recent bank statements may be requested during the application
                assessment.
              </p>
            </div>
          </div>

          <div class="requirement-item">
            <span>04</span>

            <div>
              <h3>Proof of address</h3>

              <p>
                A recent document confirming your current residential address.
              </p>
            </div>
          </div>
        </div>
      </div>

     <aside class="important-card">
  <span class="important-label">
    Important Information
  </span>

  <h3>
    Borrow responsibly
  </h3>

  <p>
    Only apply for an amount that you can reasonably afford to repay.
  </p>

  <ul>
    <li>Applications are subject to assessment.</li>
    <li>Submission does not guarantee approval.</li>
    <li>Final terms are provided after review.</li>
    <li>Additional documentation may be required.</li>
  </ul>

  <div class="documents-required">
    <h4>Documents Required for Assessment</h4>

    <ul>
      <li>🇿🇦 Certified copy of your South African ID</li>
      <li>🏦 Latest 3 months' bank statements</li>
      <li>💼 Latest 3 payslips</li>
    </ul>
  </div>
</aside>
    </section>

    <!-- PROCESS -->
    <section class="process-section">
      <div class="section-container">
        <div class="section-heading">
          <span class="section-label light">
            How It Works
          </span>

          <h2>
            Four simple application steps
          </h2>
        </div>

        <div class="process-grid">
          <article class="process-card">
            <span class="process-number">01</span>

            <h3>Complete the Form</h3>

            <p>
              Enter your contact information, requested amount and loan
              purpose.
            </p>
          </article>

          <article class="process-card">
            <span class="process-number">02</span>

            <h3>Application Review</h3>

            <p>
              The RMC Group team reviews the information you provided.
            </p>
          </article>

          <article class="process-card">
            <span class="process-number">03</span>

            <h3>Supporting Documents</h3>

            <p>
              You may be contacted to provide documents needed for assessment.
            </p>
          </article>

          <article class="process-card">
            <span class="process-number">04</span>

            <h3>Application Outcome</h3>

            <p>
              RMC Group contacts you with the outcome and any applicable next
              steps.
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- APPLICATION FORM -->
    <section id="loan-application" class="application-section">
      <div class="application-container">
        <div class="application-information">
          <span class="section-label">
            Apply Online
          </span>

          <h2>
            Submit your loan application
          </h2>

          <p>
            Complete all required fields. Please ensure that the information
            you provide is accurate.
          </p>

          <div class="application-notice">
            <strong>Please note</strong>

            <p>
              This form is an application request only. Approval, repayment
              amount, interest and final terms will be confirmed after
              assessment.
            </p>
          </div>
        </div>

        <div class="loan-card">
          <form
            class="loan-form"
            @submit.prevent="submitForm"
          >
            <div class="form-group">
              <label for="loan-name">
                Full name *
              </label>

              <input
                id="loan-name"
                v-model.trim="form.name"
                type="text"
                placeholder="Enter your full name"
                maxlength="100"
                autocomplete="name"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="loan-phone">
                  Phone number *
                </label>

                <input
                  id="loan-phone"
                  v-model.trim="form.phone"
                  type="tel"
                  placeholder="071 234 5678"
                  maxlength="20"
                  autocomplete="tel"
                  required
                />
              </div>

              <div class="form-group">
                <label for="loan-email">
                  Email address *
                </label>

                <input
                  id="loan-email"
                  v-model.trim="form.email"
                  type="email"
                  placeholder="name@example.com"
                  maxlength="150"
                  autocomplete="email"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="loan-amount">
                Requested loan amount *
              </label>

              <div class="amount-input">
                <span>R</span>

                <input
                  id="loan-amount"
                  v-model.number="form.amount"
                  type="number"
                  min="500"
                  max="10000"
                  step="100"
                  placeholder="5000"
                  required
                />
              </div>

              <small>
                Minimum amount: R500. Maximum amount: R10,000.
              </small>
            </div>

            <div class="form-group">
              <label for="loan-purpose">
                Purpose of the loan *
              </label>

              <textarea
                id="loan-purpose"
                v-model.trim="form.purpose"
                placeholder="Briefly explain why you need the loan"
                maxlength="500"
                rows="5"
                required
              ></textarea>

              <div class="documents-upload-section">
  <div class="documents-heading">
    <h3>
      Supporting Documents
    </h3>

    <p>
      Upload the following documents for assessment.
      PDF, JPG, JPEG and PNG files are accepted.
    </p>
  </div>

  <div class="form-group">
    <label for="south-african-id">
      Copy of South African ID *
    </label>

    <input
      id="south-african-id"
      type="file"
      accept=".pdf,.jpg,.jpeg,.png"
      required
      @change="handleIdUpload"
    />

    <small v-if="southAfricanIdFile">
      Selected: {{ southAfricanIdFile.name }}
    </small>
  </div>

  <div class="form-group">
    <label for="bank-statement">
      Latest 3-Month Bank Statement *
    </label>

    <input
      id="bank-statement"
      type="file"
      accept=".pdf,.jpg,.jpeg,.png"
      required
      @change="handleBankStatementUpload"
    />

    <small v-if="bankStatementFile">
      Selected: {{ bankStatementFile.name }}
    </small>
  </div>

  <div class="form-group">
    <label for="recent-payslips">
      Three Recent Payslips *
    </label>

    <input
      id="recent-payslips"
      type="file"
      accept=".pdf,.jpg,.jpeg,.png"
      required
      @change="handlePayslipUpload"
    />

    <small v-if="payslipFile">
      Selected: {{ payslipFile.name }}
    </small>
  </div>
</div>
            </div>

            <label class="consent-field">
              <input
                v-model="form.consent"
                type="checkbox"
                required
              />

              <span>
                I confirm that the information provided is correct and that
                RMC Group may contact me regarding this application.
              </span>
            </label>

            <button
              type="submit"
              :disabled="isSubmitting"
            >
              {{
                isSubmitting
                  ? "Submitting Application..."
                  : "Submit Loan Application"
              }}
            </button>
          </form>

          <div
            v-if="message"
            :class="[
              'application-message',
              {
                success: applicationSuccessful,
                error: !applicationSuccessful && !isSubmitting,
                loading: isSubmitting
              }
            ]"
            role="status"
          >
            <p>{{ message }}</p>

            <div
              v-if="applicationSuccessful && applicationReference"
              class="application-reference"
            >
              <span>Application reference</span>

              <strong>
                {{ applicationReference }}
              </strong>

              <small>
                Please save this reference for future enquiries.
              </small>
            </div>
          </div>

          <p class="terms-note">
            Terms and conditions apply. Submission does not guarantee approval.
          </p>
        </div>
      </div>
    </section>

    <div class="back-section">
      <router-link to="/" class="back-btn">
        Back to Home
      </router-link>
    </div>
  </div>
</template>


<style scoped>
* {
  box-sizing: border-box;
}

.page-container {
  min-height: 100vh;
  color: #1f2937;
  background: #ffffff;
  font-family: "Segoe UI", Arial, sans-serif;
}

.page-navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px max(24px, calc((100% - 1180px) / 2));
  background: rgba(15, 23, 42, 0.97);
  box-shadow: 0 3px 15px rgba(15, 23, 42, 0.18);
}

.nav-logo,
.nav-home {
  color: #ffffff;
  text-decoration: none;
}

.nav-logo {
  font-size: 1.4rem;
  font-weight: 800;
}

.nav-home {
  font-size: 0.95rem;
  font-weight: 650;
}

.nav-home:hover {
  color: #93c5fd;
}

.loan-hero {
  display: flex;
  align-items: center;
  min-height: 590px;
  padding: 80px 24px;
  background:
    linear-gradient(
      90deg,
      rgba(7, 18, 33, 0.88),
      rgba(7, 18, 33, 0.48)
    ),
    url("../assets/office3.jpeg") center / cover no-repeat;
}

.hero-content {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  color: #ffffff;
}

.hero-label,
.section-label {
  display: inline-block;
  margin-bottom: 12px;
  color: #2563eb;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-label {
  color: #93c5fd;
}

.hero-content h1 {
  max-width: 760px;
  margin: 0;
  font-size: clamp(2.7rem, 6vw, 5rem);
  line-height: 1.04;
}

.hero-content p {
  max-width: 650px;
  margin: 24px 0 32px;
  color: #e2e8f0;
  font-size: 1.12rem;
  line-height: 1.75;
}

.hero-button {
  display: inline-flex;
  justify-content: center;
  padding: 15px 28px;
  color: #ffffff;
  background: #2563eb;
  border-radius: 8px;
  font-weight: 750;
  text-decoration: none;
}

.hero-button:hover {
  background: #1d4ed8;
}

.section-container {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
}

.intro-section {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 60px;
  align-items: center;
  padding-top: 90px;
  padding-bottom: 90px;
}

.intro-content h2,
.section-heading h2,
.eligibility-content h2,
.application-information h2 {
  margin: 0 0 20px;
  color: #0f172a;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.15;
}

.intro-content p,
.section-heading p,
.eligibility-content > p,
.application-information > p {
  color: #64748b;
  font-size: 1.02rem;
  line-height: 1.75;
}

.intro-image {
  width: 100%;
  min-height: 420px;
  object-fit: cover;
  border-radius: 18px;
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.16);
}

.benefits-section {
  padding: 90px 0;
  background: #f8fafc;
}

.section-heading {
  max-width: 740px;
  margin: 0 auto 45px;
  text-align: center;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
}

.benefit-card {
  padding: 28px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
}

.benefit-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  margin-bottom: 18px;
  color: #ffffff;
  background: #2563eb;
  border-radius: 50%;
  font-weight: 800;
}

.benefit-card h3 {
  margin: 0 0 12px;
  color: #0f172a;
}

.benefit-card p {
  margin: 0;
  color: #64748b;
  line-height: 1.65;
}

.eligibility-section {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 55px;
  align-items: start;
  padding-top: 90px;
  padding-bottom: 90px;
}

.requirements-list {
  display: grid;
  gap: 20px;
  margin-top: 30px;
}

.requirement-item {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.requirement-item > span {
  color: #2563eb;
  font-size: 1.3rem;
  font-weight: 800;
}

.requirement-item h3 {
  margin: 0 0 6px;
  color: #0f172a;
  font-size: 1.05rem;
}

.requirement-item p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}

.important-card {
  position: sticky;
  top: 100px;
  padding: 32px;
  color: #ffffff;
  background: #0f172a;
  border-radius: 16px;
}

.important-label {
  color: #93c5fd;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.important-card h3 {
  margin: 15px 0;
  font-size: 1.7rem;
}

.important-card p,
.important-card li {
  color: #cbd5e1;
  line-height: 1.65;
}

.important-card ul {
  padding-left: 20px;
  margin-bottom: 0;
}

.process-section {
  padding: 90px 0;
  color: #ffffff;
  background: #0f172a;
}

.process-section .section-heading h2 {
  color: #ffffff;
}

.section-label.light {
  color: #93c5fd;
}

.process-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.process-card {
  padding: 28px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 14px;
}

.process-number {
  display: block;
  margin-bottom: 24px;
  color: #60a5fa;
  font-size: 2rem;
  font-weight: 800;
}

.process-card h3 {
  margin: 0 0 12px;
}

.process-card p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.65;
}

.application-section {
  padding: 95px 24px;
  background: #eff6ff;
  scroll-margin-top: 85px;
}

.application-container {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 55px;
  align-items: start;
  max-width: 1100px;
  margin: 0 auto;
}

.application-information {
  padding-top: 22px;
}

.application-notice {
  margin-top: 28px;
  padding: 20px;
  background: #ffffff;
  border-left: 4px solid #2563eb;
  border-radius: 8px;
}

.application-notice p {
  margin: 8px 0 0;
  color: #64748b;
  line-height: 1.65;
}

.loan-card {
  padding: 34px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(30, 64, 175, 0.12);
}

.loan-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
  text-align: left;
}

.form-group label {
  color: #334155;
  font-size: 0.92rem;
  font-weight: 700;
}

.form-group small {
  color: #64748b;
  font-size: 0.82rem;
}

.loan-form input,
.loan-form textarea {
  width: 100%;
  padding: 13px 14px;
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
}

.loan-form textarea {
  resize: vertical;
}

.loan-form input:focus,
.loan-form textarea:focus {
  border-color: #2563eb;
  outline: 3px solid rgba(37, 99, 235, 0.12);
}

.amount-input {
  display: flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  overflow: hidden;
}

.amount-input:focus-within {
  border-color: #2563eb;
  outline: 3px solid rgba(37, 99, 235, 0.12);
}

.amount-input span {
  padding: 13px 14px;
  color: #475569;
  background: #f1f5f9;
  font-weight: 800;
}

.amount-input input {
  border: none;
  border-radius: 0;
  outline: none;
}

.amount-input input:focus {
  outline: none;
}

.consent-field {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.5;
  cursor: pointer;
}

.consent-field input {
  width: auto;
  margin-top: 4px;
  flex-shrink: 0;
}

.loan-form button {
  width: 100%;
  padding: 14px;
  color: #ffffff;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-weight: 750;
}

.loan-form button:hover:not(:disabled) {
  background: #1d4ed8;
}

.loan-form button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.application-message {
  margin-top: 20px;
  padding: 16px;
  border-radius: 10px;
  text-align: center;
}

.application-message p {
  margin: 0;
  font-weight: 650;
}

.application-message.loading {
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.application-message.success {
  color: #166534;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
}

.application-message.error {
  color: #991b1b;
  background: #fee2e2;
  border: 1px solid #fecaca;
}

.application-reference {
  margin-top: 14px;
  padding: 14px;
  background: #ffffff;
  border: 1px dashed #22c55e;
  border-radius: 9px;
}

.application-reference span,
.application-reference small {
  display: block;
}

.application-reference span {
  margin-bottom: 5px;
  color: #64748b;
  font-size: 0.82rem;
}

.application-reference strong {
  display: block;
  margin-bottom: 6px;
  color: #166534;
  overflow-wrap: anywhere;
}

.application-reference small {
  color: #475569;
}

.terms-note {
  margin: 18px 0 0;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.5;
  text-align: center;
}

.back-section {
  padding: 34px 20px;
  text-align: center;
}

.back-btn {
  display: inline-block;
  padding: 12px 25px;
  color: #ffffff;
  background: #475569;
  border-radius: 7px;
  text-decoration: none;
  font-weight: 700;
}

.back-btn:hover {
  background: #1e293b;
}

.office-gallery {
  padding: 90px 0;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 45px;
}

.gallery-grid img {
  width: 100%;
  height: 260px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.12);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.gallery-grid img:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.2);
}

.gallery-grid img:last-child {
  grid-column: 2;
}

.documents-upload-section {
  display: grid;
  gap: 18px;
  margin-top: 8px;
  padding: 22px;
  background: #f8fafc;
  border: 1px solid #dbeafe;
  border-radius: 12px;
}

.documents-heading h3 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 1.2rem;
}

.documents-heading p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}

.documents-upload-section input[type="file"] {
  padding: 11px;
  background: #ffffff;
  cursor: pointer;
}

.documents-upload-section small {
  color: #2563eb;
  overflow-wrap: anywhere;
}

@media (max-width: 900px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .gallery-grid img:last-child {
    grid-column: auto;
  }
}

@media (max-width: 650px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .gallery-grid img {
    height: 240px;
  }
}

@media (max-width: 950px) {
  .intro-section,
  .eligibility-section,
  .application-container {
    grid-template-columns: 1fr;
  }

  .benefits-grid,
  .process-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .important-card {
    position: static;
  }
}

@media (max-width: 650px) {
  .page-navbar {
    padding: 14px 18px;
  }

  .loan-hero {
    min-height: 520px;
    padding: 60px 20px;
  }

  .hero-content h1 {
    font-size: 2.6rem;
  }

  .section-container {
    width: min(100% - 30px, 1180px);
  }

  .intro-section,
  .benefits-section,
  .eligibility-section,
  .process-section,
  .application-section {
    padding-top: 65px;
    padding-bottom: 65px;
  }

  .benefits-grid,
  .process-grid,
  .form-row {
    grid-template-columns: 1fr;
  }

  .loan-card {
    padding: 24px 18px;
  }

  .intro-image {
    min-height: 280px;
  }
}


</style>