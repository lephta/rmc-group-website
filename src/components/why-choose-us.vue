<template>
    <div class="page-container">   
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

      

  <section class=" services-section py-16 px-6 md:px-20 bg-white">
    <h2 class="text-3xl font-bold mb-12 text-center">Why Choose US</h2>

    <div class="service-card mb-10">
      <h3 class="text-xl font-semibold mb-2">1. Recruitment & Labour Broking</h3>
      <p class="mb-2">We provide skilled and unskilled workforce solutions tailored to your business needs.</p>
      <ul class="list-disc list-inside text-gray-700">
        <p>✔ Professional and experienced team</p>
        <p>✔ Nationwide service coverage</p>
        <p>✔ Reliable and timely delivery</p>
        <p>✔ Customer-focused approach</p>
        <p>✔ Affordable and competitive pricing</p>
      </ul>
      
      <hr class="my-6 border-gray-300"/>
    </div>

    <section class="page-content">
             <router-link to="/" class="btn back-btn">Back to Home</router-link>
    </section>
    
  </section>
   <footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <router-link to="/recruitment">Recruitment</router-link>
          <router-link to="/macro-lending">Short Term loans</router-link>
          <router-link to="/pest-control">Pest Control</router-link>
        </div>
        <div class="footer-copy">
          &copy; 2026 Reatlegile Management Consulting Group  | Designed & built with precision by <strong>TriSpark Digital</strong> 
        </div>
      </div>
    </footer>
</div>
</template>

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

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>

<style scoped>
/* =========================
   BASE LAYOUT
========================= */
.page-container {
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
h2.text-3xl.font-bold.mb-12.text-center {
    color: #555;
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

/* Optional custom styles */
.services-section {
  max-width: 1200px;
  margin: 0 auto;
 
}

.service-card hr {
  border-top: 1px solid #ccc;
}

.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* This will grow and push footer down */
.services-section {
  flex: 1;
}
.page-navbar {    background-color: rgba(0, 0, 0, 0.85); padding: 15px 20px; }
.nav-logo { color: #fff; font-weight: bold; text-decoration: none; font-size: 1.4rem; }
.page-content { max-width: 900px; margin: 60px auto; text-align: center; padding: 20px; }
.page-content h1 { font-size: 2.5rem; margin-bottom: 20px; color: #555; }
.page-content p { font-size: 1.1rem; margin-bottom: 15px; line-height: 1.6; }
.btn.back-btn { display:inline-block; margin-top:20px;  background: #999; color:#fff; padding:12px 25px; border-radius:6px; text-decoration:none; font-weight:600; }
.btn.back-btn:hover { background:#555; }




/* Footer */
.footer {text-align: center;
    padding: 30px;
    backdrop-filter: blur(12px);
    background: rgba(0, 0, 0, 0.65);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    color: #fff; }
.footer-links, .footer-social { margin-bottom:15px; }
.footer-links a, .footer-social a { margin:0 15px; color: #fff; font-weight:500; text-decoration:none; }
.footer-links a:hover, .footer-social a:hover { color:black; }
.footer-copy { font-size:0.9rem; color: #fff; }
</style>