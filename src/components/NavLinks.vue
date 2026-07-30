<template>
  <div class="nav-links">

    <router-link to="/">
      <Home size="18" />
      Home
    </router-link>

    <router-link to="/about">
      <Info size="18" />
      About Us
    </router-link>

    <router-link to="/services">
      <Briefcase size="18" />
      Services
    </router-link>

    <router-link to="/why-choose-us">
      <Star size="18" />
      Why Choose Us
    </router-link>

    <router-link to="/contact">
      <Phone size="18" />
      Contact
    </router-link>

    <router-link to="/directors">
      <Users size="18" />
      Directors
    </router-link>

  </div>
</template>

<script setup>
import {
  Home,
  Info,
  Briefcase,
  Star,
  Phone,
  Users
} from "lucide-vue-next";
</script>

<style scoped>
.nav-links {
  display: flex;
  align-items: center;
}

.nav-links a {
  display: flex;
  align-items: center;
  gap: 8px;

  color: #fff;
  margin-left: 20px;
  text-decoration: none;
  font-weight: 500;

  transition: 0.2s ease;
}

.nav-links a:hover {
  color: #007bff;
}

/* mobile */
@media (max-width: 768px) {
  .nav-links {
    flex-direction: column;
    width: 100%;
  }

  .nav-links a {
    margin: 12px 0;
  }
}
</style>