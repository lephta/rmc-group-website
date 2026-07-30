<script setup>
import { ref } from "vue";

import {
  Home,
  Info,
  Briefcase,
  Star,
  Phone,
  Users
} from "lucide-vue-next";

import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase";

const isMenuOpen = ref(false);
const statusMessage = ref("");
const isSubmitting = ref(false);
const submissionSuccessful = ref(false);

const createEmptyForm = () => ({
  name: "",
  email: "",
  phone: "",
  service: "",
  message: ""
});

const form = ref(createEmptyForm());

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const validateForm = () => {
  if (!form.value.name.trim()) {
    throw new Error("Please enter your name.");
  }

  if (!form.value.email.trim()) {
    throw new Error("Please enter your email address.");
  }

  if (!form.value.message.trim()) {
    throw new Error("Please enter your message.");
  }
};

const createEnquiryReference = () => {
  const randomPart = Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase();

  return `RMC-CONTACT-${Date.now()
    .toString()
    .slice(-6)}-${randomPart}`;
};

const submitContact = async () => {
  statusMessage.value = "";
  submissionSuccessful.value = false;
  isSubmitting.value = true;

  try {
    validateForm();

    const enquiryReference =
      createEnquiryReference();

    await addDoc(
      collection(db, "contactEnquiries"),
      {
        viewedByAdmin: false,
        enquiryReference,

        name: form.value.name.trim(),

        email: form.value.email
          .trim()
          .toLowerCase(),

        phone:
          form.value.phone.trim() || null,

        service:
          form.value.service ||
          "General enquiry",

        message: form.value.message.trim(),

        status: "new",
        source: "RMC website",
        createdAt: serverTimestamp()
      }
    );

    submissionSuccessful.value = true;

    statusMessage.value =
      `Thank you. Your enquiry was submitted successfully. Reference: ${enquiryReference}`;

    form.value = createEmptyForm();
  } catch (error) {
    console.error(
      "Contact enquiry submission failed:",
      error
    );

    submissionSuccessful.value = false;

    if (
      error?.code === "permission-denied"
    ) {
      statusMessage.value =
        "Firebase blocked the enquiry. Please check your Firestore security rules.";
    } else {
      statusMessage.value =
        error?.message ||
        "Your enquiry could not be submitted. Please try again.";
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-logo">
          <span style="font-size: 35px; font-weight: bolder">RMC</span>
          <span style="font-size: small"> Group</span>
        </div>

        <div class="menu-toggle" @click="toggleMenu">☰</div>

        <div :class="['nav-links', { active: isMenuOpen }]">
          <router-link to="/">
            <Home size="18" style="color: #999999" /> Home
          </router-link>

          <router-link to="/about">
            <Info size="18" style="color: #999999" /> About Us
          </router-link>

          <router-link to="/services">
            <Briefcase size="18" style="color: #999999" /> Services
          </router-link>

          <router-link to="/why-choose-us">
            <Star size="18" style="color: #999999" /> Why Choose Us
          </router-link>

          <router-link to="/contact">
            <Phone size="18" style="color: #999999" /> Contact Us
          </router-link>

          <router-link to="/directors">
            <Users size="18" style="color: #999999" /> Directors
          </router-link>
        </div>
      </div>
    </nav>

    <section class="page-content">
      <div class="page-intro">
        <h1>Contact Us</h1>
        <p>Tell us what you need and we will reach out with the right support.</p>
      </div>

      <div class="contact-layout">
        <div class="contact-cards">
          <div class="contact-card">
            <h2>Pest Control</h2>
            <p>Email: <a href="mailto:Admin@reatlegilegroup.com">Admin@reatlegilegroup.com</a></p>
            <a class="whatsapp-btn" href="https://wa.me/27721590873?text=Hello%20RMC%20Group%2C%20I%20would%20like%20more%20information%20about%20your%20services." target="_blank">Chat on WhatsApp</a>
          </div>

          <div class="contact-card">
            <h2>Short Term Loans</h2>
            <p>Email: <a href="mailto:loans@reatlegilegroup.com">loans@reatlegilegroup.com</a></p>
            <a class="whatsapp-btn" href="https://wa.me/27659793242?text=Hello%20RMC%20Group%2C%20I%20would%20like%20more%20information%20about%20your%20services." target="_blank">Chat on WhatsApp</a>
          </div>

          <div class="contact-card">
            <h2>Recruitment</h2>
            <p>Email: <a href="mailto:thabiso@reatlegilegroup.com">thabiso@reatlegilegroup.com</a></p>
            <a class="whatsapp-btn" href="https://wa.me/27659793242?text=Hello%20RMC%20Group%2C%20I%20would%20like%20more%20information%20about%20your%20services." target="_blank">Chat on WhatsApp</a>
          </div>
        </div>

        <form class="contact-form" @submit.prevent="submitContact">
          <h2>Send us a message</h2>
          <input v-model="form.name" type="text" placeholder="Your Name" required />
          <input v-model="form.email" type="email" placeholder="Your Email" required />
          <input
  v-model.trim="form.phone"
  type="tel"
  placeholder="Your Phone Number"
/>
         <select
  v-model="form.service"
  required
>
  <option value="" disabled>
    Select a service
  </option>

  <option value="Recruitment">
    Recruitment
  </option>

  <option value="Pest Control">
    Pest Control
  </option>

  <option value="Short Term Loans">
    Short Term Loans
  </option>

  <option value="General enquiry">
    General enquiry
  </option>
</select>
          <textarea v-model="form.message" rows="5" placeholder="How can we help?" required></textarea>
          <button type="submit" :disabled="isSubmitting">{{ isSubmitting ? 'Submitting...' : 'Submit enquiry' }}</button>
          <p v-if="statusMessage" class="status-message">{{ statusMessage }}</p>
        </form>
      </div>

      <router-link to="/" class="btn back-btn">Back to Home</router-link>
    </section>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <router-link to="/recruitment">Recruitment</router-link>
          <router-link to="/macro-lending">Short Term loans</router-link>
          <router-link to="/pest-control">Pest Control</router-link>
        </div>
        <div class="footer-copy">
          &copy; 2026 Reatlegile Management Consulting Group | Designed & built with precision by <strong>TriSpark Digital</strong>
        </div>
      </div>
    </footer>
  </div>
</template>



<style scoped>
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  backdrop-filter: blur(12px);
  background: rgba(0, 0, 0, 0.65);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
}

.nav-logo {
  color: #fff;
  font-weight: bold;
  font-size: 1.4rem;
}

.nav-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.nav-links a {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  margin-left: 20px;
  text-decoration: none;
}

.nav-links a:hover {
  color: #007bff;
  font-weight: 700;
}

.menu-toggle {
  display: none;
  font-size: 1.8rem;
  color: #fff;
  cursor: pointer;
}

.page-container {
  font-family: "Segoe UI", Arial, sans-serif;
  color: #333;
}

.page-content {
  max-width: 1200px;
  margin: 90px auto 40px;
  padding: 20px;
}

.page-intro {
  text-align: center;
  margin-bottom: 24px;
}

.page-intro h1 {
  font-size: clamp(2rem, 4vw, 2.8rem);
  margin-bottom: 10px;
  color: #1f2937;
}

.page-intro p {
  font-size: 1.05rem;
  color: #555;
}

.contact-layout {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 24px;
  align-items: start;
}

.contact-cards {
  display: grid;
  gap: 16px;
}

.contact-card,
.contact-form {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

.contact-card h2,
.contact-form h2 {
  margin-top: 0;
  color: #007bff;
}

.contact-card a {
  color: #007bff;
  text-decoration: none;
}

.whatsapp-btn {
  display: inline-block;
  margin-top: 8px;
  background: #25d366;
  color: #fff;
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 600;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-form input,
.contact-form select,
.contact-form textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font: inherit;
}

.contact-form button {
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 700;
}

.contact-form button:hover {
  background: #005ecb;
}

.status-message {
  margin: 0;
  color: #0f766e;
  font-weight: 600;
}

.btn.back-btn {
  display: inline-block;
  margin-top: 24px;
  background: #6b7280;
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}

.btn.back-btn:hover {
  background: #4b5563;
}

.footer {
  text-align: center;
  padding: 30px 20px;
  backdrop-filter: blur(12px);
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
}

.footer-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.footer-links a {
  color: #fff;
  text-decoration: none;
}

.footer-copy {
  font-size: 0.9rem;
  color: #f3f4f6;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .nav-links {
    display: none;
    position: absolute;
    top: 60px;
    right: 0;
    width: 100%;
    flex-direction: column;
    background: #000;
  }

  .nav-links.active {
    display: flex;
  }

  .nav-links a {
    padding: 15px;
    margin-left: 0;
  }

  .contact-layout {
    grid-template-columns: 1fr;
  }
}

.status-message.success {
  color: #15803d;
}

.status-message.error {
  color: #b91c1c;
}
</style>