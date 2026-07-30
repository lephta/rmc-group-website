<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref
} from "vue";
import { useRouter } from "vue-router";
import {
  collection,
  getCountFromServer,
  onSnapshot,
  query,
  where
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { auth, db } from "../../firebase";

const router = useRouter();
const adminEmail = ref("");
const isLoading = ref(true);
const message = ref("");
const notification = ref(null);
let notificationTimer = null;
let stopAuthListener = null;

const statistics = reactive({
  vacancies: 0,
  applications: 0,
  pestBookings: 0,
  contactEnquiries: 0,
  loanApplications: 0
});

const newItems = reactive({
  recruitmentApplications: 0,
  loanApplications: 0,
  pestBookings: 0,
  contactEnquiries: 0
});

const notificationListeners = [];
const collectionInitialised = new Set();

const totalNewItems = computed(() =>
  Object.values(newItems).reduce(
    (total, value) => total + value,
    0
  )
);

const notificationConfig = {
  applications: {
    label: "Recruitment application",
    route: "/admin/applications"
  },
  loanApplications: {
    label: "Loan application",
    route: "/admin/loan-applications"
  },
  pestBookings: {
    label: "Pest-control booking",
    route: "/admin/pest-bookings"
  },
  contactEnquiries: {
    label: "Contact enquiry",
    route: "/admin/contact-enquiries"
  }
};

const showNotification = (collectionName) => {
  const config = notificationConfig[collectionName];
  if (!config) return;

  notification.value = {
    title: `New ${config.label}`,
    text: `A new ${config.label.toLowerCase()} has been received.`,
    route: config.route
  };

  window.clearTimeout(notificationTimer);
  notificationTimer = window.setTimeout(() => {
    notification.value = null;
  }, 7000);
};

const openNotification = async () => {
  const route = notification.value?.route;
  notification.value = null;
  if (route) await router.push(route);
};

const getCollectionCount = async (collectionName) => {
  const snapshot = await getCountFromServer(
    collection(db, collectionName)
  );
  return snapshot.data().count;
};

const loadDashboardStatistics = async () => {
  isLoading.value = true;
  message.value = "";

  try {
    const values = await Promise.all([
      getCollectionCount("vacancies"),
      getCollectionCount("applications"),
      getCollectionCount("pestBookings"),
      getCollectionCount("contactEnquiries"),
      getCollectionCount("loanApplications")
    ]);

    [
      statistics.vacancies,
      statistics.applications,
      statistics.pestBookings,
      statistics.contactEnquiries,
      statistics.loanApplications
    ] = values;
  } catch (error) {
    console.error("Dashboard statistics error:", error);
    message.value =
      "Some dashboard information could not be loaded. Check your Firestore rules and connection.";
  } finally {
    isLoading.value = false;
  }
};

const listenForNewItems = (collectionName, stateProperty) => {
  const unreadQuery = query(
    collection(db, collectionName),
    where("viewedByAdmin", "==", false)
  );

  const unsubscribe = onSnapshot(
    unreadQuery,
    (snapshot) => {
      newItems[stateProperty] = snapshot.size;

      if (collectionInitialised.has(collectionName)) {
        const hasNewDocument = snapshot
          .docChanges()
          .some((change) => change.type === "added");
        if (hasNewDocument) showNotification(collectionName);
      } else {
        collectionInitialised.add(collectionName);
      }
    },
    (error) => {
      console.error(`Unable to load new ${collectionName}:`, error);
    }
  );

  notificationListeners.push(unsubscribe);
};

const logoutAdmin = async () => {
  try {
    await signOut(auth);
    await router.replace({ name: "AdminLogin" });
  } catch (error) {
    console.error("Logout error:", error);
    message.value = "The administrator could not be signed out.";
  }
};

onMounted(() => {
  stopAuthListener = onAuthStateChanged(auth, (user) => {
    adminEmail.value = user?.email || "Administrator";
  });

  loadDashboardStatistics();
  listenForNewItems("applications", "recruitmentApplications");
  listenForNewItems("loanApplications", "loanApplications");
  listenForNewItems("pestBookings", "pestBookings");
  listenForNewItems("contactEnquiries", "contactEnquiries");
});

onBeforeUnmount(() => {
  stopAuthListener?.();
  notificationListeners.forEach((unsubscribe) => unsubscribe());
  window.clearTimeout(notificationTimer);
});
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <span>RMC Group</span>
        <strong>Admin Portal</strong>
      </div>

      <nav class="sidebar-navigation">
        <router-link to="/admin/dashboard" class="navigation-link">
          <span class="navigation-icon">⌂</span>
          <span class="navigation-text">Dashboard</span>
        </router-link>

        <router-link to="/admin/vacancies" class="navigation-link">
          <span class="navigation-icon">▣</span>
          <span class="navigation-text">Vacancies</span>
        </router-link>

        <router-link to="/admin/applications" class="navigation-link">
          <span class="navigation-icon">▤</span>
          <span class="navigation-text">Recruitment Applications</span>
          <span v-if="newItems.recruitmentApplications" class="sidebar-badge">
            {{ newItems.recruitmentApplications }}
          </span>
        </router-link>

        <router-link to="/admin/pest-bookings" class="navigation-link">
          <span class="navigation-icon">◷</span>
          <span class="navigation-text">Pest Bookings</span>
          <span v-if="newItems.pestBookings" class="sidebar-badge">
            {{ newItems.pestBookings }}
          </span>
        </router-link>

        <router-link to="/admin/contact-enquiries" class="navigation-link">
          <span class="navigation-icon">✉</span>
          <span class="navigation-text">Contact Enquiries</span>
          <span v-if="newItems.contactEnquiries" class="sidebar-badge">
            {{ newItems.contactEnquiries }}
          </span>
        </router-link>

        <router-link to="/admin/loan-applications" class="navigation-link">
          <span class="navigation-icon">R</span>
          <span class="navigation-text">Loan Applications</span>
          <span v-if="newItems.loanApplications" class="sidebar-badge">
            {{ newItems.loanApplications }}
          </span>
        </router-link>
      </nav>

      <button class="logout-button" type="button" @click="logoutAdmin">
        Sign out
      </button>
    </aside>

    <main class="admin-content">
      <header class="admin-header">
        <div>
          <span class="page-label">Administration</span>
          <h1>Dashboard overview</h1>
          <p>Monitor RMC Group website activity and customer submissions.</p>
        </div>

        <div class="header-right">
          <button
            type="button"
            class="refresh-button"
            :disabled="isLoading"
            @click="loadDashboardStatistics"
          >
            {{ isLoading ? "Refreshing..." : "Refresh" }}
          </button>

          <div class="admin-profile">
            <span class="profile-avatar">A</span>
            <div>
              <strong>Administrator</strong>
              <small>{{ adminEmail }}</small>
            </div>
          </div>
        </div>
      </header>

      <div v-if="message" class="dashboard-message">{{ message }}</div>

      <div v-if="totalNewItems > 0" class="new-summary">
        <strong>{{ totalNewItems }} new submission{{ totalNewItems === 1 ? "" : "s" }}</strong>
        <span>Open a management page and click View to clear its notification.</span>
      </div>

      <section class="statistics-grid">
        <router-link to="/admin/vacancies" class="statistic-card statistic-link">
          <div class="statistic-heading"><span>Vacancies</span><span class="statistic-icon">▣</span></div>
          <strong>{{ isLoading ? "..." : statistics.vacancies }}</strong>
          <p>Jobs currently stored in Firestore</p>
        </router-link>

        <router-link to="/admin/applications" class="statistic-card statistic-link">
          <div class="statistic-heading">
            <span>Applications</span><span class="statistic-icon">▤</span>
            <span v-if="newItems.recruitmentApplications" class="new-badge">{{ newItems.recruitmentApplications }} New</span>
          </div>
          <strong>{{ isLoading ? "..." : statistics.applications }}</strong>
          <p>Recruitment applications received</p>
        </router-link>

        <router-link to="/admin/pest-bookings" class="statistic-card statistic-link">
          <div class="statistic-heading">
            <span>Pest bookings</span><span class="statistic-icon">◷</span>
            <span v-if="newItems.pestBookings" class="new-badge">{{ newItems.pestBookings }} New</span>
          </div>
          <strong>{{ isLoading ? "..." : statistics.pestBookings }}</strong>
          <p>Pest-control booking requests</p>
        </router-link>

        <router-link to="/admin/contact-enquiries" class="statistic-card statistic-link">
          <div class="statistic-heading">
            <span>Contact enquiries</span><span class="statistic-icon">✉</span>
            <span v-if="newItems.contactEnquiries" class="new-badge">{{ newItems.contactEnquiries }} New</span>
          </div>
          <strong>{{ isLoading ? "..." : statistics.contactEnquiries }}</strong>
          <p>General customer enquiries</p>
        </router-link>

        <router-link to="/admin/loan-applications" class="statistic-card statistic-link">
          <div class="statistic-heading">
            <span>Loan applications</span><span class="statistic-icon">R</span>
            <span v-if="newItems.loanApplications" class="new-badge">{{ newItems.loanApplications }} New</span>
          </div>
          <strong>{{ isLoading ? "..." : statistics.loanApplications }}</strong>
          <p>Lending applications received</p>
        </router-link>
      </section>

      <section class="welcome-panel">
        <div>
          <span class="page-label">RMC Management System</span>
          <h2>Your administration system is connected</h2>
          <p>Totals and unread notification counts are connected to Firebase Firestore in real time.</p>
        </div>
        <router-link to="/" class="website-button">View public website</router-link>
      </section>
    </main>

    <transition name="notification-slide">
      <aside v-if="notification" class="notification-popup" role="status">
        <button class="notification-close" type="button" aria-label="Close notification" @click="notification = null">×</button>
        <span class="notification-symbol">🔔</span>
        <div>
          <strong>{{ notification.title }}</strong>
          <p>{{ notification.text }}</p>
          <button type="button" class="notification-open" @click="openNotification">Open submission</button>
        </div>
      </aside>
    </transition>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.admin-layout {
  display: grid;
  grid-template-columns: 270px 1fr;
  min-height: 100vh;
  color: #1e293b;
  background: #f1f5f9;
  font-family: "Segoe UI", Arial, sans-serif;
}

.admin-sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 28px 20px;
  color: #ffffff;
  background: #0f172a;
}

.sidebar-brand {
  display: flex;
  flex-direction: column;
  padding: 0 12px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.sidebar-brand span {
  color: #93c5fd;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.sidebar-brand strong {
  margin-top: 7px;
  font-size: 1.5rem;
}

.sidebar-navigation {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 7px;
  margin-top: 28px;
}

.navigation-link {
  display: flex;
  gap: 13px;
  align-items: center;
  padding: 13px 14px;
  color: #cbd5e1;
  border-radius: 9px;
  text-decoration: none;
  font-weight: 650;
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.navigation-link:hover,
.navigation-link.router-link-active {
  color: #ffffff;
  background: #2563eb;
}

.navigation-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  font-weight: 800;
}

.logout-button {
  width: 100%;
  padding: 13px;
  color: #ffffff;
  background: transparent;
  border: 1px solid #475569;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.logout-button:hover {
  background: #1e293b;
}

.admin-content {
  min-width: 0;
  padding: 42px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  align-items: center;
  margin-bottom: 34px;
}

.page-label {
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.admin-header h1 {
  margin: 9px 0;
  color: #0f172a;
  font-size: clamp(2rem, 4vw, 3.2rem);
}

.admin-header p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}

.admin-profile {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 230px;
  padding: 12px 15px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.profile-avatar {
  display: flex;
  flex: 0 0 42px;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  color: #ffffff;
  background: #2563eb;
  border-radius: 50%;
  font-weight: 800;
}

.admin-profile div {
  min-width: 0;
}

.admin-profile strong,
.admin-profile small {
  display: block;
}

.admin-profile small {
  margin-top: 3px;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-message {
  margin-bottom: 25px;
  padding: 14px;
  color: #92400e;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 9px;
}

.statistics-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.statistic-card {
  padding: 25px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.statistic-heading {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  align-items: center;
  color: #64748b;
  font-size: 0.91rem;
  font-weight: 700;
}

.statistic-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 9px;
  font-weight: 800;
}

.statistic-card > strong {
  display: block;
  margin: 16px 0 8px;
  color: #0f172a;
  font-size: 2.3rem;
}

.statistic-card p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.86rem;
  line-height: 1.5;
}

.welcome-panel {
  display: flex;
  justify-content: space-between;
  gap: 35px;
  align-items: center;
  margin-top: 30px;
  padding: 35px;
  color: #ffffff;
  background:
    linear-gradient(
      120deg,
      #0f172a,
      #1e3a8a
    );
  border-radius: 17px;
}

.welcome-panel h2 {
  margin: 11px 0;
  font-size: clamp(1.7rem, 3vw, 2.4rem);
}

.welcome-panel p {
  max-width: 680px;
  margin: 0;
  color: #cbd5e1;
  line-height: 1.7;
}

.welcome-panel .page-label {
  color: #93c5fd;
}

.website-button {
  flex: 0 0 auto;
  padding: 13px 20px;
  color: #0f172a;
  background: #ffffff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 750;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  margin-bottom: 30px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.refresh-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 18px;
  color: #ffffff;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.refresh-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.refresh-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}

.card-header h3 {
  margin: 0;
}

.new-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 62px;
  padding: 6px 10px;
  color: #ffffff;
  background: #dc2626;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 800;
  white-space: nowrap;
  animation: notificationPulse 1.8s infinite;
}

@keyframes notificationPulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.35);
  }

  50% {
    box-shadow: 0 0 0 7px rgba(220, 38, 38, 0);
  }
}

@media (max-width: 760px) {
  .admin-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-right {
    width: 100%;
    align-items: flex-start;
    flex-direction: column;
  }
}
@media (max-width: 760px) {
  .dashboard-header {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 1050px) {
  .statistics-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .admin-layout {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    position: static;
    height: auto;
  }

  .sidebar-navigation {
    flex: initial;
  }

  .admin-content {
    padding: 30px 20px;
  }

  .admin-header,
  .welcome-panel {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-profile {
    width: 100%;
  }
}

@media (max-width: 560px) {
  .statistics-grid {
    grid-template-columns: 1fr;
  }
}


/* Notification additions */
.navigation-text { flex: 1; }
.sidebar-badge, .new-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #dc2626;
  color: #fff;
  font-size: .72rem;
  font-weight: 800;
}
.statistic-link { color: inherit; text-decoration: none; }
.statistic-link:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(15,23,42,.10); }
.new-summary { display:flex; gap:12px; align-items:center; margin-bottom:20px; padding:14px 18px; border:1px solid #bfdbfe; border-radius:12px; background:#eff6ff; color:#1e3a8a; }
.notification-popup { position:fixed; right:24px; bottom:24px; z-index:1000; display:flex; gap:14px; width:min(390px,calc(100vw - 32px)); padding:20px; border:1px solid #bfdbfe; border-radius:16px; background:#fff; box-shadow:0 24px 60px rgba(15,23,42,.24); }
.notification-symbol { font-size:1.5rem; }
.notification-popup strong { display:block; color:#0f172a; font-size:1rem; }
.notification-popup p { margin:5px 0 12px; color:#64748b; line-height:1.5; }
.notification-close { position:absolute; top:8px; right:10px; border:0; background:transparent; color:#64748b; font-size:1.3rem; cursor:pointer; }
.notification-open { border:0; border-radius:8px; padding:9px 13px; background:#2563eb; color:#fff; font-weight:700; cursor:pointer; }
.notification-slide-enter-active,.notification-slide-leave-active { transition:.25s ease; }
.notification-slide-enter-from,.notification-slide-leave-to { opacity:0; transform:translateY(18px); }
@media(max-width:700px){.new-summary{align-items:flex-start;flex-direction:column}.notification-popup{right:16px;bottom:16px}.navigation-text{font-size:.88rem}}

</style>