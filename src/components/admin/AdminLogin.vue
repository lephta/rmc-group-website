<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

import { auth } from "../../firebase";

const ADMIN_UID =
  "XWwjnE1whIMyWqcW0yQeec5jf8a2";

const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");
const message = ref("");
const isLoading = ref(false);

const loginAdmin = async () => {
  if (isLoading.value) {
    return;
  }

  message.value = "";

  if (!email.value.trim()) {
    message.value =
      "Please enter your admin email address.";

    return;
  }

  if (!password.value) {
    message.value =
      "Please enter your admin password.";

    return;
  }

  isLoading.value = true;

  try {
    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email.value.trim(),
        password.value
      );

    if (
      userCredential.user.uid !== ADMIN_UID
    ) {
      await signOut(auth);

      message.value =
        "This account is not authorised to access the RMC administration portal.";

      return;
    }

    const redirectPath =
      typeof route.query.redirect === "string"
        ? route.query.redirect
        : "/admin/dashboard";

    await router.replace(redirectPath);
  } catch (error) {
    console.error("Admin login error:", error);

    switch (error.code) {
      case "auth/invalid-credential":
        message.value =
          "The email address or password is incorrect.";
        break;

      case "auth/user-not-found":
        message.value =
          "No administrator account was found.";
        break;

      case "auth/wrong-password":
        message.value =
          "The email address or password is incorrect.";
        break;

      case "auth/too-many-requests":
        message.value =
          "Too many login attempts. Please wait and try again.";
        break;

      case "auth/network-request-failed":
        message.value =
          "A network error occurred. Check your internet connection.";
        break;

      default:
        message.value =
          "The administrator could not be signed in.";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <main class="admin-login-page">
    <section class="login-panel">
      <div class="brand-section">
        <span class="brand-label">
          RMC Group
        </span>

        <h1>
          Administration Portal
        </h1>

        <p>
          Secure access for authorised RMC Group
          administrators.
        </p>

        <router-link
          to="/"
          class="home-link"
        >
          Return to website
        </router-link>
      </div>

      <div class="form-section">
        <div class="form-heading">
          <span>Secure login</span>

          <h2>
            Welcome back
          </h2>

          <p>
            Sign in using your administrator
            email and password.
          </p>
        </div>

        <form
          class="login-form"
          @submit.prevent="loginAdmin"
        >
          <div class="form-group">
            <label for="admin-email">
              Email address
            </label>

            <input
              id="admin-email"
              v-model.trim="email"
              type="email"
              placeholder="admin@example.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="form-group">
            <label for="admin-password">
              Password
            </label>

            <input
              id="admin-password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              autocomplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            :disabled="isLoading"
          >
            {{
              isLoading
                ? "Signing in..."
                : "Sign in to dashboard"
            }}
          </button>
        </form>

        <div
          v-if="message"
          class="error-message"
          role="alert"
        >
          {{ message }}
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.admin-login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 30px;
  background:
    radial-gradient(
      circle at top right,
      rgba(37, 99, 235, 0.22),
      transparent 34%
    ),
    #0f172a;
  font-family: "Segoe UI", Arial, sans-serif;
}

.login-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: min(1000px, 100%);
  overflow: hidden;
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
}

.brand-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 590px;
  padding: 65px;
  color: #ffffff;
  background:
    linear-gradient(
      rgba(15, 23, 42, 0.9),
      rgba(15, 23, 42, 0.92)
    ),
    url("../../assets/pest control2.jpg")
      center / cover no-repeat;
}

.brand-label {
  margin-bottom: 16px;
  color: #93c5fd;
  font-size: 0.83rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.brand-section h1 {
  margin: 0 0 22px;
  font-size: clamp(2.3rem, 4vw, 4rem);
  line-height: 1.05;
}

.brand-section p {
  max-width: 430px;
  margin: 0 0 35px;
  color: #cbd5e1;
  font-size: 1.05rem;
  line-height: 1.7;
}

.home-link {
  width: fit-content;
  padding-bottom: 5px;
  color: #ffffff;
  border-bottom: 1px solid #60a5fa;
  text-decoration: none;
  font-weight: 700;
}

.form-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 65px;
}

.form-heading span {
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.form-heading h2 {
  margin: 12px 0;
  color: #0f172a;
  font-size: 2.2rem;
}

.form-heading p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 32px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #334155;
  font-size: 0.9rem;
  font-weight: 700;
}

.form-group input {
  width: 100%;
  padding: 14px;
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  font: inherit;
}

.form-group input:focus {
  border-color: #2563eb;
  outline: 3px solid rgba(37, 99, 235, 0.12);
}

.login-form button {
  width: 100%;
  margin-top: 5px;
  padding: 15px;
  color: #ffffff;
  background: #2563eb;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  font: inherit;
  font-weight: 750;
}

.login-form button:hover:not(:disabled) {
  background: #1d4ed8;
}

.login-form button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.error-message {
  margin-top: 22px;
  padding: 14px;
  color: #991b1b;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 9px;
  line-height: 1.5;
}

@media (max-width: 800px) {
  .login-panel {
    grid-template-columns: 1fr;
  }

  .brand-section {
    min-height: auto;
    padding: 45px 30px;
  }

  .form-section {
    padding: 45px 30px;
  }
}

@media (max-width: 500px) {
  .admin-login-page {
    padding: 15px;
  }

  .brand-section,
  .form-section {
    padding: 35px 22px;
  }
}
</style>