<script setup>
import { computed, ref } from "vue";

import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase";
import pestVideo from "../assets/pest-control-vid.mp4";

const form = ref({
  name: "",
  contact: "",
  address: "",
  date: "",
  time: ""
});

const message = ref("");
const isSubmitting = ref(false);
const bookingSuccessful = ref(false);
const bookingReference = ref("");

const minimumBookingDate = computed(() => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
});

const createBookingReference = () => {
  return `PEST-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;
};

const resetForm = () => {
  form.value = {
    name: "",
    contact: "",
    address: "",
    date: "",
    time: ""
  };
};

const validateBooking = () => {
  if (!form.value.name.trim()) {
    throw new Error("Please enter your full name.");
  }

  if (!form.value.contact.trim()) {
    throw new Error("Please enter your contact number.");
  }

  if (!form.value.address.trim()) {
    throw new Error("Please enter the service address.");
  }

  if (!form.value.date) {
    throw new Error("Please select a booking date.");
  }

  if (!form.value.time) {
    throw new Error("Please select a booking time.");
  }

  if (form.value.date < minimumBookingDate.value) {
    throw new Error(
      "Please select today or a future date."
    );
  }
};

const bookService = async () => {
  if (isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;
  message.value = "";
  bookingSuccessful.value = false;
  bookingReference.value = "";

  try {
    validateBooking();

    message.value = "Saving your booking request...";

    const reference = createBookingReference();

    await addDoc(
      collection(db, "pestBookings"),
      {
        viewedByAdmin: false,
        name: form.value.name.trim(),
        contact: form.value.contact.trim(),
        phone: form.value.contact.trim(),
        address: form.value.address.trim(),
        bookingDate: form.value.date,
        bookingTime: form.value.time,
        bookingReference: reference,
        status: "new",
        createdAt: serverTimestamp()
      }
    );

    bookingReference.value = reference;
    bookingSuccessful.value = true;

    message.value =
      "Your pest control booking request was submitted successfully. RMC Group will contact you to confirm availability.";

    resetForm();
  } catch (error) {
    console.error("Pest booking error:", error);

    bookingSuccessful.value = false;

    if (error?.code === "permission-denied") {
      message.value =
        "Firebase blocked the booking. Please confirm that your Firestore rules are published.";
    } else {
      message.value =
        error?.message ||
        "Your booking could not be submitted. Please try again.";
    }
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

    <!-- HERO SECTION -->
    <section class="pest-hero">
      <div class="hero-overlay"></div>

      <div class="hero-content">
        <span class="hero-label">
          Reliable Pest Management
        </span>

        <h1>
          Professional Pest Control Services
        </h1>

        <p>
          Protect your home, office and business with reliable pest-control
          solutions from RMC Group.
        </p>

        <a href="#booking-section" class="hero-button">
          Book a Service
        </a>
      </div>
    </section>

    <!-- INTRODUCTION -->
    <section class="intro-section section-container">
      <div class="intro-content">
        <span class="section-label">
          RMC Pest Control
        </span>

        <h2>
          Safe and dependable pest-control solutions
        </h2>

        <p>
          We provide professional pest-control services for residential,
          commercial and industrial properties. Our team helps identify,
          treat and manage pest problems using practical and responsible
          solutions.
        </p>
      </div>

      <img
        src="../assets/pest control2.jpg"
        alt="RMC Group pest control service"
        class="intro-image"
      />
    </section>

    <!-- SERVICES -->
    <section class="services-section">
      <div class="section-container">
        <div class="section-heading">
          <span class="section-label">
            Our Services
          </span>

          <h2>
            Pest-control services we provide
          </h2>

          <p>
            Select a service and submit a booking request. Our team will
            contact you to confirm the inspection and treatment details.
          </p>
        </div>

        <div class="services-grid">
          <article class="service-card">
            <div class="service-icon">🪳</div>
            <h3>Cockroach Control</h3>
            <p>
              Treatment solutions for cockroach infestations in homes,
              offices, kitchens and commercial properties.
            </p>
          </article>

          <article class="service-card">
            <div class="service-icon">🐜</div>
            <h3>Ant Control</h3>
            <p>
              Targeted treatment for indoor and outdoor ant problems around
              residential and business properties.
            </p>
          </article>

          <article class="service-card">
            <div class="service-icon">🐀</div>
            <h3>Rodent Control</h3>
            <p>
              Inspection and control services for rats and mice, including
              advice on preventing future activity.
            </p>
          </article>

          <article class="service-card">
            <div class="service-icon">🪵</div>
            <h3>Termite Treatment</h3>
            <p>
              Property inspections and treatment support for termites that
              may damage wooden structures.
            </p>
          </article>

          <article class="service-card">
            <div class="service-icon">🛏️</div>
            <h3>Bed Bug Treatment</h3>
            <p>
              Careful treatment of affected bedrooms, guest houses,
              accommodation facilities and residential properties.
            </p>
          </article>

          <article class="service-card">
            <div class="service-icon">🏢</div>
            <h3>Commercial Pest Control</h3>
            <p>
              Scheduled pest-management solutions for offices, shops,
              warehouses and other commercial facilities.
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- WHY CHOOSE US -->
    <section class="why-section section-container">
      <div class="video-wrapper">
        <video
          controls
          autoplay
          muted
          loop
          playsinline
          class="service-video"
        >
          <source :src="pestVideo" type="video/mp4" />

          Your browser does not support the video element.
        </video>
      </div>

      <div class="why-content">
        <span class="section-label">
          Why Choose Us?
        </span>

        <h2>
          Professional service you can rely on
        </h2>

        <div class="benefits-list">
          <div class="benefit-item">
            <span class="benefit-check">✓</span>

            <div>
              <h3>Residential and commercial services</h3>
              <p>
                We assist homeowners, businesses, landlords and property
                managers.
              </p>
            </div>
          </div>

          <div class="benefit-item">
            <span class="benefit-check">✓</span>

            <div>
              <h3>Professional inspections</h3>
              <p>
                We assess the pest problem before recommending an appropriate
                service.
              </p>
            </div>
          </div>

          <div class="benefit-item">
            <span class="benefit-check">✓</span>

            <div>
              <h3>Convenient booking</h3>
              <p>
                Customers can select a preferred date and time directly from
                the website.
              </p>
            </div>
          </div>

          <div class="benefit-item">
            <span class="benefit-check">✓</span>

            <div>
              <h3>Customer-focused support</h3>
              <p>
                Our team contacts customers to confirm the booking and discuss
                the service requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PROCESS -->
    <section class="process-section">
      <div class="section-container">
        <div class="section-heading">
          <span class="section-label">
            How It Works
          </span>

          <h2>
            Four simple steps
          </h2>
        </div>

        <div class="process-grid">
          <article class="process-card">
            <span class="process-number">01</span>
            <h3>Submit a Booking</h3>
            <p>
              Complete the online form and select your preferred date and time.
            </p>
          </article>

          <article class="process-card">
            <span class="process-number">02</span>
            <h3>Booking Confirmation</h3>
            <p>
              Our team contacts you to confirm the booking and service details.
            </p>
          </article>

          <article class="process-card">
            <span class="process-number">03</span>
            <h3>Property Inspection</h3>
            <p>
              We inspect the affected area and determine the appropriate
              treatment.
            </p>
          </article>

          <article class="process-card">
            <span class="process-number">04</span>
            <h3>Treatment and Support</h3>
            <p>
              The treatment is completed, followed by practical prevention
              advice where necessary.
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- BOOKING -->
    <section id="booking-section" class="booking-section">
      <div class="booking-container">
        <div class="booking-information">
          <span class="section-label">
            Book a Service
          </span>

          <h2>
            Request a pest-control booking
          </h2>

          <p>
            Complete the booking form with your contact information, service
            address and preferred appointment time.
          </p>

          <div class="booking-notice">
            <strong>Please note:</strong>

            <p>
              Your selected date and time is a booking request. RMC Group will
              contact you to confirm availability and the final service
              details.
            </p>
          </div>
        </div>

        <div class="booking-card">
          <form
            class="booking-form"
            @submit.prevent="bookService"
          >
            <div class="form-group">
              <label for="pest-name">
                Full name *
              </label>

              <input
                id="pest-name"
                v-model.trim="form.name"
                type="text"
                placeholder="Enter your full name"
                maxlength="100"
                autocomplete="name"
                required
              />
            </div>

            <div class="form-group">
              <label for="pest-contact">
                Contact number *
              </label>

              <input
                id="pest-contact"
                v-model.trim="form.contact"
                type="tel"
                placeholder="Example: 071 234 5678"
                maxlength="20"
                autocomplete="tel"
                required
              />
            </div>

            <div class="form-group">
              <label for="pest-address">
                Service address *
              </label>

              <input
                id="pest-address"
                v-model.trim="form.address"
                type="text"
                placeholder="Enter the service address"
                maxlength="200"
                autocomplete="street-address"
                required
              />
            </div>

            <div class="booking-grid">
              <div class="form-group">
                <label for="pest-date">
                  Preferred date *
                </label>

                <input
                  id="pest-date"
                  v-model="form.date"
                  type="date"
                  :min="minimumBookingDate"
                  required
                />
              </div>

              <div class="form-group">
                <label for="pest-time">
                  Preferred time *
                </label>

                <input
                  id="pest-time"
                  v-model="form.time"
                  type="time"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
            >
              {{
                isSubmitting
                  ? "Submitting Booking..."
                  : "Book Pest Control Service"
              }}
            </button>
          </form>

          <div
            v-if="message"
            :class="[
              'booking-message',
              {
                success: bookingSuccessful,
                error: !bookingSuccessful && !isSubmitting,
                loading: isSubmitting
              }
            ]"
            role="status"
          >
            <p>{{ message }}</p>

            <div
              v-if="bookingSuccessful && bookingReference"
              class="booking-reference"
            >
              <span>Booking reference</span>

              <strong>
                {{ bookingReference }}
              </strong>

              <small>
                Please save this reference for future enquiries.
              </small>
            </div>
          </div>
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
  background: rgba(15, 23, 42, 0.96);
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
  font-weight: 600;
}

.nav-home:hover {
  color: #93c5fd;
}

.pest-hero {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 590px;
  padding: 80px 24px;
  overflow: hidden;
  background:
    linear-gradient(
      rgba(7, 18, 33, 0.66),
      rgba(7, 18, 33, 0.78)
    ),
    url("../assets/pest control2.jpg") center / cover no-repeat;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 75% 30%,
      rgba(37, 99, 235, 0.24),
      transparent 35%
    );
}

.hero-content {
  position: relative;
  z-index: 1;
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
  font-size: clamp(2.6rem, 6vw, 5rem);
  line-height: 1.04;
}

.hero-content p {
  max-width: 650px;
  margin: 24px 0 32px;
  color: #e2e8f0;
  font-size: 1.15rem;
  line-height: 1.75;
}

.hero-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 15px 28px;
  color: #ffffff;
  background: #2563eb;
  border-radius: 8px;
  font-weight: 700;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.hero-button:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
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
.why-content h2,
.booking-information h2 {
  margin: 0 0 20px;
  color: #0f172a;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.15;
}

.intro-content p,
.section-heading p,
.why-content p,
.booking-information p {
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

.services-section {
  padding: 90px 0;
  background: #f8fafc;
}

.section-heading {
  max-width: 740px;
  margin: 0 auto 45px;
  text-align: center;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.service-card {
  padding: 28px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 35px rgba(15, 23, 42, 0.11);
}

.service-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  margin-bottom: 18px;
  background: #eff6ff;
  border-radius: 12px;
  font-size: 1.6rem;
}

.service-card h3 {
  margin: 0 0 12px;
  color: #0f172a;
  font-size: 1.15rem;
}

.service-card p {
  margin: 0;
  color: #64748b;
  line-height: 1.65;
}

.why-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  padding-top: 90px;
  padding-bottom: 90px;
}

.video-wrapper {
  overflow: hidden;
  border-radius: 18px;
  background: #0f172a;
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.18);
}

.service-video {
  display: block;
  width: 100%;
  min-height: 480px;
  object-fit: cover;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 22px;
  margin-top: 30px;
}

.benefit-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.benefit-check {
  display: flex;
  flex: 0 0 34px;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: #ffffff;
  background: #2563eb;
  border-radius: 50%;
  font-weight: 800;
}

.benefit-item h3 {
  margin: 0 0 5px;
  color: #0f172a;
  font-size: 1.05rem;
}

.benefit-item p {
  margin: 0;
  font-size: 0.95rem;
}

.process-section {
  padding: 90px 0;
  color: #ffffff;
  background: #0f172a;
}

.process-section .section-heading h2 {
  color: #ffffff;
}

.process-section .section-label {
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
  color: #ffffff;
  font-size: 1.1rem;
}

.process-card p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.65;
}

.booking-section {
  padding: 95px 24px;
  background: #eff6ff;
  scroll-margin-top: 85px;
}

.booking-container {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 55px;
  align-items: start;
  max-width: 1100px;
  margin: 0 auto;
}

.booking-information {
  padding-top: 22px;
}

.booking-notice {
  margin-top: 28px;
  padding: 20px;
  background: #ffffff;
  border-left: 4px solid #2563eb;
  border-radius: 8px;
}

.booking-notice strong {
  color: #0f172a;
}

.booking-notice p {
  margin: 8px 0 0;
  font-size: 0.92rem;
}

.booking-card {
  padding: 34px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(30, 64, 175, 0.12);
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
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

.booking-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.booking-form input {
  width: 100%;
  padding: 13px 14px;
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
}

.booking-form input:focus {
  border-color: #2563eb;
  outline: 3px solid rgba(37, 99, 235, 0.12);
}

.booking-form button {
  width: 100%;
  padding: 14px;
  color: #ffffff;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  transition: background 0.2s ease;
}

.booking-form button:hover:not(:disabled) {
  background: #1d4ed8;
}

.booking-form button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.booking-message {
  margin-top: 20px;
  padding: 16px;
  border-radius: 10px;
  text-align: center;
}

.booking-message p {
  margin: 0;
  font-weight: 650;
}

.booking-message.loading {
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.booking-message.success {
  color: #166534;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
}

.booking-message.error {
  color: #991b1b;
  background: #fee2e2;
  border: 1px solid #fecaca;
}

.booking-reference {
  margin-top: 14px;
  padding: 14px;
  background: #ffffff;
  border: 1px dashed #22c55e;
  border-radius: 9px;
}

.booking-reference span,
.booking-reference small {
  display: block;
}

.booking-reference span {
  margin-bottom: 5px;
  color: #64748b;
  font-size: 0.82rem;
}

.booking-reference strong {
  display: block;
  margin-bottom: 6px;
  color: #166534;
  overflow-wrap: anywhere;
}

.booking-reference small {
  color: #475569;
}

.back-section {
  padding: 34px 20px;
  text-align: center;
  background: #ffffff;
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

@media (max-width: 900px) {
  .intro-section,
  .why-section,
  .booking-container {
    grid-template-columns: 1fr;
  }

  .services-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .process-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .intro-image,
  .service-video {
    min-height: 360px;
  }
}

@media (max-width: 600px) {
  .page-navbar {
    padding: 14px 18px;
  }

  .pest-hero {
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
  .services-section,
  .why-section,
  .process-section,
  .booking-section {
    padding-top: 65px;
    padding-bottom: 65px;
  }

  .services-grid,
  .process-grid,
  .booking-grid {
    grid-template-columns: 1fr;
  }

  .booking-card {
    padding: 24px 18px;
  }

  .intro-image,
  .service-video {
    min-height: 280px;
  }
}
</style>