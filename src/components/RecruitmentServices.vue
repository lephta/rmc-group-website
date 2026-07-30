<template>
  <div class="recruitment-services-page">
    <header class="hero-section">
      <div class="hero-overlay"></div>

      <div class="hero-content">
        <span class="hero-label">RMC Group Recruitment</span>
        <h1>Recruitment Services</h1>
        <p>Connecting businesses with the right talent.</p>
      </div>
    </header>

    <main>
      <section class="section intro-section">
        <div class="section-container intro-grid">
          <div>
            <span class="section-label">About Us</span>
            <h2>About Our Recruitment Services</h2>
          </div>

          <div class="intro-copy">
            <p>
              At <strong>RMC Group</strong>, we specialize in sourcing, screening,
              and placing qualified candidates across various industries.
            </p>

            <p>
              Our recruitment process is designed to ensure that businesses get
              reliable, skilled, and professional employees.
            </p>
          </div>
        </div>
      </section>

      <section class="section offers-section">
        <div class="section-container">
          <div class="section-heading">
            <span class="section-label">Our Solutions</span>
            <h2>What We Offer</h2>
            <p>
              Professional recruitment solutions designed for employers and job seekers.
            </p>
          </div>

          <div class="offers-grid">
            <article
              v-for="offer in offers"
              :key="offer.title"
              class="offer-card"
            >
              <div class="offer-icon">
                <CheckCircle2 :size="27" />
              </div>

              <h3>{{ offer.title }}</h3>
              <p>{{ offer.description }}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section process-section">
        <div class="section-container">
          <div class="section-heading">
            <span class="section-label">Simple Process</span>
            <h2>How to Apply</h2>
            <p>Follow these simple steps to submit your recruitment application.</p>
          </div>

          <div class="steps-grid">
            <article
              v-for="(step, index) in steps"
              :key="step.title"
              class="step-card"
            >
              <span class="step-number">{{ index + 1 }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <div class="section-container cta-content">
          <div>
            <span class="section-label light-label">Take the Next Step</span>
            <h2>Ready to apply?</h2>
            <p>
              Submit your details and CV through our recruitment application page.
              Our team will contact you shortly after reviewing your information.
            </p>
          </div>

          <div class="cta-actions">
            <router-link to="/recruitment" class="primary-button">
              Apply Now
              <ArrowRight :size="18" />
            </router-link>

            <router-link to="/" class="secondary-button">
              <Home :size="18" />
              Back to Home
            </router-link>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import {
  ArrowRight,
  CheckCircle2,
  Home
} from "lucide-vue-next";

const offers = [
  {
    title: "Permanent and Temporary Placements",
    description:
      "We connect businesses with suitable candidates for both long-term and short-term employment needs."
  },
  {
    title: "Labour Broking Services",
    description:
      "Flexible workforce solutions that help businesses meet changing operational requirements."
  },
  {
    title: "Skilled and Unskilled Workforce Sourcing",
    description:
      "Access to candidates across different industries, experience levels, and job categories."
  },
  {
    title: "Fast and Efficient Hiring Process",
    description:
      "A clear recruitment process focused on reducing hiring time while maintaining candidate quality."
  }
];

const steps = [
  {
    title: "Click Apply Now",
    description:
      "Use the Apply Now button below to open the recruitment and vacancies page."
  },
  {
    title: "Fill in Your Details",
    description:
      "Provide the personal and contact information requested in the application form."
  },
  {
    title: "Submit Your Request",
    description:
      "Upload the required information and submit your application for review."
  },
  {
    title: "Wait for Contact",
    description:
      "Our recruitment team will contact you shortly if your profile matches an opportunity."
  }
];
</script>

<style scoped>
.recruitment-services-page {
  min-height: 100vh;
  color: #0f172a;
  background: #f8fafc;
  font-family: "Segoe UI", Arial, sans-serif;
}

.hero-section {
  position: relative;
  display: flex;
  min-height: 430px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 80px 20px;
  background:
    linear-gradient(rgba(15, 23, 42, 0.78), rgba(30, 58, 138, 0.76)),
    url("../assets/RMC-Recreuitment.jpeg") center/cover no-repeat;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(96, 165, 250, 0.28), transparent 42%);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 850px;
  color: #fff;
  text-align: center;
}

.hero-label,
.section-label {
  display: inline-block;
  margin-bottom: 12px;
  color: #2563eb;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.hero-label {
  color: #bfdbfe;
}

.hero-content h1 {
  margin: 0;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 1.05;
}

.hero-content p {
  margin: 22px 0 0;
  color: #dbeafe;
  font-size: clamp(1.05rem, 2.2vw, 1.35rem);
}

.section {
  padding: 85px 20px;
}

.section-container {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.intro-section {
  background: #fff;
}

.intro-grid {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 70px;
  align-items: start;
}

.intro-grid h2,
.section-heading h2,
.cta-content h2 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.15;
}

.intro-copy p {
  margin: 0 0 20px;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.85;
}

.offers-section {
  background: linear-gradient(135deg, #eff6ff, #f8fafc);
}

.section-heading {
  max-width: 720px;
  margin: 0 auto 48px;
  text-align: center;
}

.section-heading p {
  margin: 17px 0 0;
  color: #64748b;
  line-height: 1.7;
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.offer-card,
.step-card {
  background: #fff;
  border: 1px solid #dbeafe;
  border-radius: 18px;
  box-shadow: 0 14px 35px rgba(15, 23, 42, 0.07);
}

.offer-card {
  padding: 30px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.offer-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 22px 44px rgba(15, 23, 42, 0.12);
}

.offer-icon {
  display: flex;
  width: 54px;
  height: 54px;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: #fff;
  background: #2563eb;
  border-radius: 15px;
}

.offer-card h3,
.step-card h3 {
  margin: 0 0 12px;
  font-size: 1.18rem;
}

.offer-card p,
.step-card p {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

.process-section {
  background: #fff;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.step-card {
  position: relative;
  padding: 28px;
  overflow: hidden;
}

.step-number {
  display: inline-flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
  color: #1e3a8a;
  background: #dbeafe;
  border-radius: 50%;
  font-weight: 900;
}

.cta-section {
  padding: 75px 20px;
  color: #fff;
  background: linear-gradient(120deg, #0f172a, #1e3a8a);
}

.cta-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 50px;
}

.cta-content > div:first-child {
  max-width: 690px;
}

.light-label {
  color: #93c5fd;
}

.cta-content p {
  margin: 18px 0 0;
  color: #cbd5e1;
  line-height: 1.75;
}

.cta-actions {
  display: flex;
  min-width: 230px;
  flex-direction: column;
  gap: 12px;
}

.primary-button,
.secondary-button {
  display: inline-flex;
  min-height: 50px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 22px;
  border-radius: 9px;
  font-weight: 800;
  text-decoration: none;
  transition: transform 0.2s ease, background 0.2s ease;
}

.primary-button {
  color: #fff;
  background: #2563eb;
}

.primary-button:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
}

.secondary-button {
  color: #dbeafe;
  border: 1px solid rgba(191, 219, 254, 0.45);
  background: rgba(255, 255, 255, 0.06);
}

.secondary-button:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

@media (max-width: 900px) {
  .intro-grid,
  .offers-grid,
  .steps-grid {
    grid-template-columns: 1fr;
  }

  .intro-grid {
    gap: 30px;
  }

  .cta-content {
    align-items: stretch;
    flex-direction: column;
  }

  .cta-actions {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .hero-section {
    min-height: 360px;
  }

  .section {
    padding: 60px 16px;
  }

  .offer-card,
  .step-card {
    padding: 24px;
  }
}
</style>
