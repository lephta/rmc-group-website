<script setup>
import { ref } from "vue";
import {
  Home,
  Info,
  Briefcase,
  Star,
  Phone,
  Users,
  Building2
} from "lucide-vue-next";

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const companies = [
  { name: "Comsol Networks" },
  { name: "Munich Re" },
  { name: "CSIR" },
  { name: "Botshoga Group" },
  { name: "RTMC" },
  { name: "Golden Key Distributors" },
  { name: "Telkom" },
  { name: "Vodacom" },
  { name: "Diamond Mine" },
  { name: "South West Media College" },
  { name: "OSHC" },
  { name: "Emalahleni Local Municipality" }
];
</script>


<template>
  <div class="about-container">
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

    <!-- Page Content -->
    <section class="page-content">
      <h1>About Us</h1>

      <img class="hero-image" src="../assets/Team-RMC.jpg" alt="RMC Team">

      <p>
        Reatlegile Management Consulting Group (RMC) is a multi-service company
        providing professional solutions in short-term loans, recruitment, and pest control.
        Our goal is to deliver reliable services, create opportunities, and build long-term
        client relationships.
      </p>

      <p>
        We are committed to excellence, innovation, and providing trusted solutions
        that meet your business and personal needs.
      </p>

       <!-- Companies / References Section -->
<section class="references-section">
  <div class="section-heading">
    <span class="section-label">Our Experience</span>
    <h2>Companies We’ve Worked With</h2>
    <p>
      RMC Group is proud to have provided professional services and solutions
      to organisations across the public and private sectors.
    </p>
  </div>

  <div class="companies-grid">
    <article
      v-for="company in companies"
      :key="company.name"
      class="company-card"
    >
      <div class="company-icon">
        <Building2 :size="28" />
      </div>

      <h3>{{ company.name }}</h3>
    </article>
  </div>

  <p class="reference-note">
    References and supporting information are available upon request.
  </p>
</section>

      <router-link to="/" class="btn back-btn">
        Back to Home
      </router-link>
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
          &copy; 2026 Reatlegile Management Consulting Group |
          Designed & built with precision by <strong>TriSpark Digital</strong>
        </div>

      </div>
    </footer>

  </div>
</template>

<style scoped>

/* =========================
   BASE
========================= */
.about-container {
  font-family: 'Segoe UI', Arial, sans-serif;
  color: #333;
padding-top: 25px;
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
/* =========================
   PAGE CONTENT
========================= */
.page-content {
  max-width: 900px;
  margin: 60px auto;
  text-align: center;
  padding: 20px;
}

.page-content h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
   color: #555;
}

.page-content p {
  font-size: 1.1rem;
  margin-bottom: 15px;
  line-height: 1.6;
}

.hero-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  margin-bottom: 20px;
  border-radius: 10px;
}

/* =========================
   COMPANY REFERENCES
========================= */
.references-section {
  margin-top: 60px;
  padding: 50px 30px;
  background: #f7f7f7;
  border-radius: 18px;
}

.section-heading {
  max-width: 680px;
  margin: 0 auto 35px;
}

.section-label {
  display: inline-block;
  margin-bottom: 10px;
  color: #777;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.section-heading h2 {
  margin: 0 0 12px;
  color: #333;
  font-size: 2rem;
}

.section-heading p {
  color: #666;
  font-size: 1rem;
}

.companies-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.company-card {
  min-height: 135px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 14px;
  padding: 25px 15px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}

.company-card:hover {
  transform: translateY(-5px);
  border-color: #999;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}

.company-icon {
  width: 55px;
  height: 55px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #eeeeee;
  color: #555;
  border-radius: 50%;
}

.company-card h3 {
  margin: 0;
  color: #333;
  font-size: 1rem;
  font-weight: 650;
  line-height: 1.4;
}

.reference-note {
  margin: 30px 0 0 !important;
  color: #777;
  font-size: 0.9rem !important;
  font-style: italic;
}

/* Tablet */
@media (max-width: 768px) {
  .references-section {
    padding: 40px 20px;
  }

  .companies-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .section-heading h2 {
    font-size: 1.7rem;
  }
}

/* Small mobile */
@media (max-width: 480px) {
  .companies-grid {
    grid-template-columns: 1fr;
  }

  .company-card {
    min-height: 110px;
  }
}

/* =========================
   BUTTON
========================= */
.btn.back-btn {
  display: inline-block;
  margin-top: 20px;
  background: #999;
  color: #fff;
  padding: 12px 25px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
}

.btn.back-btn:hover {
  background: #555;
}

/* =========================
   FOOTER
========================= */
.footer {
  text-align: center;
    padding: 30px;
    backdrop-filter: blur(12px);
    background: rgba(0, 0, 0, 0.65);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    color: #fff;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
}

.footer-links a {
  color: #fff;
  text-decoration: none;
}

.footer-links a:hover {
    
    color: black;
    font-weight: 500;
    text-decoration: none;

}

</style>