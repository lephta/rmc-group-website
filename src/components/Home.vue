<template>
  <div class="home-container">
    <!-- Navbar -->
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

    <!-- Hero Section -->
   <!-- Hero Section -->
<section class="hero-section">
  <div class="hero-overlay"></div>

  <div class="hero-content">
    <span class="hero-badge">
      Trusted Business Solutions
    </span>

    <h1>
      Reatlegile Management Consulting Group
    </h1>

    <p>
      Delivering professional Recruitment, Labour Broking,
      Micro Lending and Pest Control solutions
      to businesses and individuals across South Africa.
    </p>

    <div class="hero-buttons">
      <router-link
        to="/services"
        class="hero-primary"
      >
        Explore Our Services
      </router-link>

      <router-link
        to="/contact"
        class="hero-secondary"
      >
        Contact Us
      </router-link>
    </div>
  </div>
</section>

    <!-- Welcome Section -->
    <section class="welcome-section">
      <div class="welcome-container">
        <h2>Welcome to RMC Group</h2>
        <p>
          Reatlegile Management Consulting Group (RMC) is a professional service
          provider specializing in Recruitment, Labour Broking, Cleaning
          Services, Pest Control, and Financial Solutions.
        </p>
        <p>
          We are committed to delivering reliable, efficient, and client-focused
          solutions across South Africa.
        </p>
        
      </div>
    </section>
 <hr class="section-divider" />
    <!-- Cards Section -->
   <!-- Services Cards Section -->

<section class="services-section">
  <canvas
    ref="smokeCanvas"
    class="smoke-canvas"
    aria-hidden="true"
  ></canvas>

  <div class="services-container">
    <!-- Heading, cards and View All RMC Services button -->
  </div>


  <div class="services-container">
    <div class="services-heading">
      <span class="services-label">Our Services</span>

      <h2>Professional solutions for your needs</h2>

      <p>
        Explore the main services offered by Reatlegile Management Consulting
        Group.
      </p>
    </div>

    <div class="services-grid">
     
      <!-- Recruitment -->
<article class="service-card">
  <div class="service-image-wrapper">
    <img
      src="../assets/RMC-Recreuitment.jpeg"
      alt="RMC Group recruitment services"
    />

    <span class="service-category">
      Recruitment
    </span>
  </div>

  <div class="service-content">
    <div class="service-icon">
      <Users :size="27" />
    </div>

    <h3>Recruitment & Labour Broking</h3>

    <p>
      Helping organisations find suitable candidates while giving job
      seekers access to available employment opportunities.
    </p>

    <ul>
      <li>Available vacancies</li>
      <li>Candidate applications</li>
      <li>Recruitment support</li>
    </ul>

    <div class="service-actions">
      <router-link
        to="/recruitment-services"
        class="service-primary"
      >
        Learn More
      </router-link>

      <router-link
        to="/recruitment"
        class="service-secondary"
      >
        View Vacancies
      </router-link>
    </div>
  </div>
</article>

      <!-- Short-Term Loans -->
      <article class="service-card featured">
        <div class="featured-label">
          Popular Service
        </div>

        <div class="service-image-wrapper">
          <img
            src="../assets/short-term-loan.jpg"
            alt="RMC Group short-term loan services"
          />

          <span class="service-category">
            Financial Solutions
          </span>
        </div>

        <div class="service-content">
          <div class="service-icon">
            <WalletCards :size="27" />
          </div>

          <h3>Short-Term Loans</h3>

          <p>
            A simple online application process for customers seeking
            short-term financial assistance.
          </p>

          <ul>
            <li>Online applications</li>
            <li>Application assessment</li>
            <li>Clear communication</li>
          </ul>

          <div class="service-actions">
            <router-link
              to="/macro-lending"
              class="service-primary"
            >
              Apply Now
            </router-link>

            <a
              href="https://wa.me/27721590873"
              target="_blank"
              rel="noopener noreferrer"
              class="service-secondary whatsapp-link"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </article>

      <!-- Pest Control -->
      <article class="service-card">
        <div class="service-image-wrapper">
          <img
            src="../assets/RMC-Pest-Control.jpg"
            alt="RMC Group pest-control services"
          />

          <span class="service-category">
            Property Services
          </span>
        </div>

        <div class="service-content">
          <div class="service-icon">
            <ShieldCheck :size="27" />
          </div>

          <h3>Pest Control</h3>

          <p>
            Pest-management services for residential, commercial and
            industrial properties.
          </p>

          <ul>
            <li>Residential treatment</li>
            <li>Commercial pest management</li>
            <li>Online service bookings</li>
          </ul>

          <div class="service-actions">
            <router-link
              to="/pest-control"
              class="service-primary"
            >
              Book a Service
            </router-link>

            <a
              href="https://wa.me/27721590873"
              target="_blank"
              rel="noopener noreferrer"
              class="service-secondary whatsapp-link"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </article>
    </div>

    <div class="services-footer">
      <router-link to="/services" class="view-services-button">
        View All RMC Services
        <ArrowRight :size="18" />
      </router-link>
    </div>
  </div>
</section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <router-link to="/recruitment">Recruitment</router-link>
          <router-link to="/macro-lending">Short Term loans</router-link>
          <router-link to="/pest-control">Pest Control</router-link>
        </div>

        <div class="footer-copy">
          &copy; 2026 Reatlegile Management Consulting Group | Designed & built
          with precision by <strong>TriSpark Digital</strong>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

import {
  Home,
  Info,
  Briefcase,
  Star,
  Phone,
  Users,
  WalletCards,
  ShieldCheck,
  ArrowRight,
  Menu,
  X
} from "lucide-vue-next";

/* Mobile navigation */
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

/* Floating bubbles */
const smokeCanvas = ref(null);

let animationFrameId = null;
let resizeHandler = null;

class Bubble {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset(true);
  }

  reset(startAnywhere = false) {
    this.radius = Math.random() * 35 + 12;
    this.x = Math.random() * this.canvas.width;

    this.y = startAnywhere
      ? Math.random() * this.canvas.height
      : this.canvas.height + this.radius;

    this.speedY = Math.random() * 0.45 + 0.18;
    this.speedX = Math.random() * 0.35 - 0.175;
    this.opacity = Math.random() * 0.16 + 0.05;
  }

  update() {
    this.y -= this.speedY;
    this.x += this.speedX;

    if (this.y + this.radius < 0) {
      this.reset();
    }

    if (this.x - this.radius > this.canvas.width) {
      this.x = -this.radius;
    }

    if (this.x + this.radius < 0) {
      this.x = this.canvas.width + this.radius;
    }
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    context.fillStyle = `rgba(37, 99, 235, ${this.opacity})`;
    context.fill();

    context.strokeStyle = `rgba(147, 197, 253, ${
      this.opacity + 0.05
    })`;

    context.lineWidth = 1;
    context.stroke();
  }
}

onMounted(() => {
  const canvas = smokeCanvas.value;

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  let bubbles = [];

  const resizeCanvas = () => {
    const parent = canvas.parentElement;

    canvas.width = parent?.clientWidth || window.innerWidth;
    canvas.height = parent?.clientHeight || 600;

    const bubbleCount = window.innerWidth <= 640 ? 14 : 28;

    bubbles = Array.from(
      { length: bubbleCount },
      () => new Bubble(canvas)
    );
  };

  const animate = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    bubbles.forEach((bubble) => {
      bubble.update();
      bubble.draw(context);
    });

    animationFrameId = window.requestAnimationFrame(animate);
  };

  resizeHandler = resizeCanvas;

  window.addEventListener("resize", resizeHandler);

  resizeCanvas();
  animate();
});

onBeforeUnmount(() => {
  if (animationFrameId) {
    window.cancelAnimationFrame(animationFrameId);
  }

  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
  }
});

</script>

<style scoped>
/* =========================
   BASE LAYOUT
========================= */
.home-container {
  padding-top: 80px;
  font-family: "Segoe UI", Arial, sans-serif;
}

/* =========================
   NAVBAR
========================= */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  backdrop-filter: blur(12px);
  background: rgba(0, 0, 0, 0.65);
  border-bottom: 1px solid rgba(255,255,255,0.08);
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
  color: black;
  font-weight: 700;
}

.menu-toggle {
  display: none;
  font-size: 1.8rem;
  color: #fff;
  cursor: pointer;
}

/* =========================
   MOBILE NAV
========================= */
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
}

/* ==========================================
   HERO SECTION
========================================== */

.hero-section {
  position: relative;

  min-height: 560px;

  display: flex;
  justify-content: center;
  align-items: center;

  overflow: hidden;

  background-image:
    url("../assets/hero-building.jpg");

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero-overlay {
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      rgba(0, 0, 0, 0.65),
      rgba(0, 0, 0, 0.60)
    );

  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;

  max-width: 900px;

  padding: 20px;

  text-align: center;

  color: white;
}

.hero-badge {
  display: inline-block;

  margin-bottom: 25px;

  padding: 10px 20px;

  border-radius: 50px;

  background: rgba(37, 99, 235, .95);

  font-size: .85rem;

  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 2px;
}

.hero-content h1 {
  margin-bottom: 25px;

  font-size: clamp(2.8rem, 6vw, 4.5rem);

  line-height: 1.2;

  font-weight: 800;
}

.hero-content p {
  max-width: 720px;

  margin: auto;

  font-size: 1.2rem;

  line-height: 1.9;

  color: rgba(255,255,255,.95);
}

.hero-buttons {
  display: flex;

  justify-content: center;

  gap: 18px;

  margin-top: 45px;

  flex-wrap: wrap;
}

.hero-primary,
.hero-secondary {
  display: inline-flex;

  justify-content: center;

  align-items: center;

  min-width: 220px;

  height: 56px;

  border-radius: 8px;

  text-decoration: none;

  font-weight: 700;

  transition: .3s;
}

.hero-primary {
  background: #2563eb;

  color: white;
}

.hero-primary:hover {
  background: #1d4ed8;

  transform: translateY(-3px);
}

.hero-secondary {
  background: rgba(255,255,255,.15);

  color: white;

  border: 1px solid rgba(255,255,255,.4);

  backdrop-filter: blur(8px);
}

.hero-secondary:hover {
  background: rgba(255,255,255,.25);

  transform: translateY(-3px);
}

@media (max-width:768px) {

  .hero-section{
    min-height:480px;
  }

  .hero-content h1{
    font-size:2.2rem;
  }

  .hero-content p{
    font-size:1rem;
  }

  .hero-buttons{
    flex-direction:column;
    align-items:center;
  }

  .hero-primary,
  .hero-secondary{
    width:100%;
    max-width:320px;
  }

}

/* =========================
   WELCOME
========================= */
.welcome-section {
  padding: 80px 20px;
  background: linear-gradient(to bottom, #ffffff, #f5f7fb);
}
.welcome-container h2 {
  font-size: 2rem;
  margin-bottom: 15px;
}

.welcome-container p {
  color: #555;
  line-height: 1.6;
}

.welcome-container {
  max-width: 900px;
  margin: auto;
}

/* =========================
  hr-line 
========================= */

.section-divider {
  width: 90%;
  height: 1px;
  background: #000;
  opacity: 0.2;
 margin: 0px auto 0;
  border: none;
}

/* =========================
   CARDS
========================= */
.cards-section {
  position: relative;
  padding: 60px 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #eef3ff, #ffffff);
}

.cards-section::before {
  content: "";
  position: absolute;
  bottom: -100px;
  width: 100%;
  height: 200%;
  background: radial-gradient(
    circle at 50% 100%,
    rgba(0, 123, 255, 0.15),
    transparent 60%
  );
  animation: riseSmoke 12s infinite ease-in-out;
  z-index: 0;
  pointer-events: none;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 1200px;
  margin: auto;
  position: relative;
  z-index: 1;
}

/* CARD */
.card {
  flex: 1;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  text-align: center;
  transition: 0.35s ease;

  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

.card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
}

.card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

/* CARD BUTTONS */
/* =========================
   CARD BUTTON BASE STYLE
========================= */
.card-buttons .btn {
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  display: inline-block;
  color: #fff;
  transition: 0.25s ease;
}

/* =========================
   PRIMARY BUTTON (BLUE)
   used by all .btn inside cards
========================= */
.card-buttons .btn {
  background-color: #007bff;
}

/* =========================
   WHATSAPP GREEN BUTTON
   overrides ONLY WhatsApp links
========================= */
.card-buttons a[href*="wa.me"],
.card-buttons a[href*="whatsapp"] {
  background-color: #25d366;
}

/* =========================
   HOVER EFFECT
========================= */
.card-buttons .btn:hover {
  transform: translateY(-3px);
  opacity: 0.9;
}

.smoke-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

/* =========================
   CARD BUTTON WRAPPER
========================= */
.card-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;

  padding: 20px 15px 25px; /* 👈 space inside card */
  margin-top: 10px;
}

/* =========================
   BASE BUTTON STYLE
========================= */
.card-buttons .btn {
  padding: 12px 22px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  display: inline-block;
  color: #fff;

  transition: 0.25s ease;
}

/* =========================
   DEFAULT BLUE BUTTON
========================= */
.card-buttons .btn {
  background-color: #007bff;
}

/* =========================
   WHATSAPP GREEN OVERRIDE
========================= */
.card-buttons a[href*="wa.me"],
.card-buttons a[href*="whatsapp"] {
  background-color: #25d366;
}

/* =========================
   HOVER EFFECT
========================= */
.card-buttons .btn:hover {
  transform: translateY(-3px);
  opacity: 0.9;
}

/* =========================
   FOOTER
========================= */
.footer {
  background: #e0e0e0;
  text-align: center;
  padding: 30px;
    backdrop-filter: blur(12px);
    background: rgba(0, 0, 0, 0.65);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
color:#fff;
}
.footer-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
}

.footer-links a {
    color: #fff;
  font-weight: 500;
  text-decoration: none;
}

.footer-links a:hover {
  color: black;
}
/* =========================
   ANIMATION
========================= */
@keyframes riseSmoke {
  0% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-120px);
    opacity: 0.3;
  }
  100% {
    transform: translateY(-250px);
    opacity: 0;
  }
}

/* =========================
   RESPONSIVE CARDS
========================= */
@media (max-width: 1024px) {
  .cards-container {
    grid-template-columns: 1fr;
  }

  .hero-content h1 {
    font-size: 2.2rem;
  }
}

@media (max-width: 640px) {
  .card-buttons {
    flex-direction: column;
  }

  .card-buttons .btn {
    width: 100%;
  }

  .hero-content h1 {
    font-size: 1.8rem;
  }

  .hero-content p {
    font-size: 1rem;
  }
}


/* =========================
   NEW SERVICES SECTION
========================= */

.services-section {
  padding: 80px 20px;
  background: linear-gradient(135deg, #eef3ff, #ffffff);
}

.services-container {
  width: min(1200px, 100%);
  margin: 0 auto;
}

.services-heading {
  max-width: 720px;
  margin: 0 auto 45px;
  text-align: center;
}

.services-label {
  display: inline-block;
  margin-bottom: 10px;
  color: #2563eb;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.services-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(2rem, 4vw, 3rem);
}

.services-heading p {
  margin: 18px 0 0;
  color: #64748b;
  font-size: 1rem;
  line-height: 1.7;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
  align-items: stretch;
}

.service-card {
  position: relative;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 17px;
  box-shadow: 0 14px 35px rgba(15, 23, 42, 0.08);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.14);
}

.service-card.featured {
  border-color: #93c5fd;
}

.featured-label {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 3;
  padding: 7px 11px;
  color: #ffffff;
  background: #2563eb;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 800;
}

.service-image-wrapper {
  position: relative;
  height: 240px;
  overflow: hidden;
}

.service-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.service-card:hover .service-image-wrapper img {
  transform: scale(1.06);
}

.service-image-wrapper::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    transparent 45%,
    rgba(15, 23, 42, 0.78)
  );
  content: "";
}

.service-category {
  position: absolute;
  bottom: 17px;
  left: 19px;
  z-index: 2;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.service-content {
  position: relative;
  padding: 30px;
}

.service-icon {
  position: absolute;
  top: -28px;
  right: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 57px;
  height: 57px;
  color: #ffffff;
  background: #2563eb;
  border: 5px solid #ffffff;
  border-radius: 50%;
}

.service-content h3 {
  margin: 0 0 14px;
  color: #0f172a;
  font-size: 1.32rem;
}

.service-content > p {
  min-height: 84px;
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

.service-content ul {
  padding: 20px 0 0;
  margin: 20px 0 0;
  border-top: 1px solid #e2e8f0;
  list-style: none;
}

.service-content li {
  position: relative;
  padding: 5px 0 5px 20px;
  color: #475569;
  font-size: 0.9rem;
}

.service-content li::before {
  position: absolute;
  left: 0;
  color: #2563eb;
  font-weight: 900;
  content: "✓";
}

.service-actions {
  display: flex;
  gap: 10px;
  margin-top: 25px;
}

.service-primary,
.service-secondary {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 43px;
  padding: 0 13px;
  border-radius: 7px;
  font-size: 0.85rem;
  font-weight: 750;
  text-align: center;
  text-decoration: none;
}

.service-primary {
  color: #ffffff;
  background: #2563eb;
}

.service-primary:hover {
  background: #1d4ed8;
}

.service-secondary {
  color: #1e3a8a;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.service-secondary:hover {
  background: #dbeafe;
}

.whatsapp-link {
  color: #166534;
  background: #ecfdf5;
  border-color: #bbf7d0;
}

.whatsapp-link:hover {
  background: #dcfce7;
}

.services-footer {
  margin-top: 45px;
  text-align: center;
}

.view-services-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 50px;
  padding: 0 25px;
  color: #1e3a8a;
  background: #ffffff;
  border: 1px solid #93c5fd;
  border-radius: 8px;
  font-weight: 750;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}

.view-services-button:hover {
  background: #eff6ff;
  border-color: #2563eb;
  transform: translateY(-2px);
}

@media (max-width: 1024px) {
  .services-grid {
    grid-template-columns: 1fr;
    max-width: 720px;
    margin: 0 auto;
  }

  .service-content > p {
    min-height: auto;
  }
}

@media (max-width: 640px) {
  .services-section {
    padding: 60px 15px;
  }

  .service-actions {
    flex-direction: column;
  }

  .service-primary,
  .service-secondary,
  .view-services-button {
    width: 100%;
  }
}


.services-section {
  position: relative;
  overflow: hidden;
}

.smoke-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;

  /* Allows clicks to pass through the canvas */
  pointer-events: none;
}

.services-container {
  position: relative;
  z-index: 1;
}

.service-card,
.service-actions,
.services-footer,
.service-primary,
.service-secondary,
.view-services-button {
  position: relative;
  z-index: 2;
}
</style>
