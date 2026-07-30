<template>
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
  <div class="page-container">
   

   <section class="page-content">
 <div class="leadership-header">
  <div class="leadership-icon">
    <Users :size="42" />
  </div>

  <span class="section-label">RMC Group</span>
  <h1>LEADERSHIP PROFILE</h1>

  <p class="leadership-intro">
    RMC Group is guided by experienced leadership, strong business values,
    and a commitment to building sustainable partnerships with clients,
    investors, employees, and communities.
  </p>
</div>

<h2>Founder and Director</h2>
  <p>
  Thabiso Mthombeni is the Founder and Director of Reatlegile Management
  Consulting Group (RMC), a dynamic multi-service company delivering
  professional solutions across recruitment, labour broking, cleaning
  services, pest control, and financial services.
</p>

<p>
  As RMC continues to grow, the company remains open to strategic
  partnerships, investment opportunities, and the addition of experienced
  professionals who share its long-term vision.
</p>
  <p>
    With over 15+ years of experience in Human Resources and Recruitment, both locally and internationally, 
    Thabiso brings a wealth of industry knowledge, leadership, and strategic insight into the business. 
    His career has been built on a strong foundation of people management, talent acquisition, and business 
    operations, making him a trusted professional in his field.
  </p>

  <hr />

  <h2>The Meaning Behind RMC</h2>
  <p>
    Reatlegile Management Consulting Group (RMC) holds a deeply personal significance. The company is proudly 
    named after Thabiso’s first daughter, Reatlegile, symbolizing legacy, purpose, and a commitment to building 
    something meaningful for future generations.
  </p>
  <p>
    This inspiration drives the company’s values of integrity, responsibility, and long-term impact.
  </p>

  <hr />

  <h2>Leadership Approach</h2>
  <ul class="custom-list">
    <li>Creating employment opportunities</li>
    <li>Delivering reliable and high-quality services</li>
    <li>Building long-term client relationships</li>
    <li>Empowering individuals and businesses</li>
  </ul>
  <p>
  RMC’s leadership approach is rooted in professionalism, accountability,
  collaboration, and service excellence. As the organisation expands, its
  leadership structure will continue to evolve through strategic
  partnerships and the involvement of professionals with complementary
  skills and experience.
</p>

  <hr />

  <h2>Professional Strengths</h2>
  <ul class="custom-list">
    <li>Talent Acquisition & Recruitment Strategy</li>
    <li>Labour Relations & Workforce Management</li>
    <li>Business Development</li>
    <li>Client Relationship Management</li>
    <li>Operational Excellence</li>
  </ul>

  <hr />

 <h2>Vision for RMC</h2>

<p>
  The vision is to establish RMC as a leading South African service provider,
  recognised for reliability, professionalism, innovation, and its ability
  to deliver tailored solutions across multiple industries.
</p>

<p>
  RMC aims to build a strong and diverse leadership structure supported by
  strategic investors, business partners, and experienced professionals who
  can contribute to the company’s sustainable growth.
</p>
  <hr />

<h2>Leadership Commitment</h2>
  <p class="quote">
    “At RMC, we don’t just provide services — we build relationships, create opportunities, 
    and deliver solutions that make a real difference.”
  </p>
  <p><strong>– Thabiso Mthombeni</strong><br />Director, RMC Group</p>

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

.page-container { font-family: 'Segoe UI', Arial, sans-serif; color: #333; }
.page-navbar {     background-color: rgba(0, 0, 0, 0.85); padding: 15px 20px; }
.nav-logo { color: #fff; font-weight: bold; text-decoration: none; font-size: 1.4rem; }
.page-content { max-width: 900px; margin: 60px auto; text-align: center; padding: 20px; }
.page-content h1 { font-size: 2.5rem; margin-bottom: 20px; color: #555; }
.page-content h2 { font-size: 2rem; margin-top: 20px; margin-bottom: 10px; }
.page-content p { font-size: 1.1rem; line-height: 1.6; margin-bottom: 15px; }
.btn.back-btn { display:inline-block; margin-top:20px;  background: #999; color:#fff; padding:12px 25px; border-radius:6px; text-decoration:none; font-weight:600; }
.btn.back-btn:hover { background:#555; }


/* =========================
   LEADERSHIP HEADER
========================= */
.leadership-header {
  margin-bottom: 45px;
  padding: 50px 30px;
  background: linear-gradient(135deg, #f8f8f8, #eeeeee);
  border: 1px solid #e2e2e2;
  border-radius: 16px;
}

.leadership-icon {
  width: 85px;
  height: 85px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 18px;
  background: #555;
  color: #fff;
  border-radius: 50%;
}

.section-label {
  display: block;
  margin-bottom: 8px;
  color: #777;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.leadership-header h1 {
  margin: 0 0 15px;
  color: #333;
}

.leadership-intro {
  max-width: 700px;
  margin: 0 auto !important;
  color: #666;
}

/* Footer */
.footer {text-align: center;
    padding: 30px;
    backdrop-filter: blur(12px);
    background: rgba(0, 0, 0, 0.65);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    color: #fff;  }
.footer-links, .footer-social { margin-bottom:15px; }
.footer-links a, .footer-social a { margin:0 15px; color: #fff; font-weight:500; text-decoration:none; }
.footer-links a:hover, .footer-social a:hover { color:black; }
.footer-copy { font-size:0.9rem; color: #fff; }


.custom-list {
  list-style: none;
  padding: 0;
  margin: 15px 0;
}

.custom-list li {
  margin: 8px 0;
  font-size: 1.05rem;
}

.custom-list li::before {
  content: "✔ ";
  font-weight: bold;
}

hr {
  margin: 30px auto;
  width: 60%;
  border: 0;
  border-top: 1px solid #ddd;
}

.quote {
  font-style: italic;
  font-size: 1.1rem;
  color: #555;
  margin: 15px 0;
}
</style>