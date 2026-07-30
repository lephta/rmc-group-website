import {
  createRouter,
  createWebHistory
} from "vue-router";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

// Main pages
import Home from "../components/Home.vue";

// Recruitment
import Recruitment from "../components/Recruitment.vue";
import RecruitmentApply from "../components/recruitment-apply.vue";

// Services
import MacroLending from "../components/MacroLending.vue";
import PestControl from "../components/PestControl.vue";

// Other pages
import About from "../components/About.vue";
import Directors from "../components/Directors.vue";
import Contact from "../components/Contact.vue";
import WhyChooseUs from "../components/why-choose-us.vue";
import Services from "../components/Services.vue";

// Admin pages
import AdminLogin from "../components/admin/AdminLogin.vue";
import AdminDashboard from "../components/admin/AdminDashboard.vue";
import AdminVacancies from "../components/admin/AdminVacancies.vue";
import AdminApplications from "../components/admin/AdminApplications.vue";
import AdminPestBookings from "../components/admin/AdminPestBookings.vue";
import AdminContactEnquiries from "../components/admin/AdminContactEnquiries.vue";
import AdminLoanApplications from "../components/admin/AdminLoanApplications.vue";


const ADMIN_UID = "XWwjnE1whIMyWqcW0yQeec5jf8a2";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },

  // Recruitment
  {
    path: "/recruitment",
    name: "Recruitment",
    component: Recruitment
  },
  {
    path: "/recruitment-apply",
    name: "RecruitmentApply",
    component: RecruitmentApply
  },
  {
    path: "/vacancies/:id",
    name: "VacancyDetails",
    component: () =>
      import("../views/VacancyDetails.vue")
  },

  // Services
  {
    path: "/macro-lending",
    name: "MacroLending",
    component: MacroLending
  },
  {
    path: "/pest-control",
    name: "PestControl",
    component: PestControl
  },

  // Other pages
  {
    path: "/about",
    name: "About",
    component: About
  },
  {
    path: "/directors",
    name: "Directors",
    component: Directors
  },
  {
    path: "/contact",
    name: "Contact",
    component: Contact
  },
  {
    path: "/services",
    name: "Services",
    component: Services
  },
  {
    path: "/why-choose-us",
    name: "WhyChooseUs",
    component: WhyChooseUs
  },

// Admin
{
  path: "/admin",
  redirect: "/admin/dashboard"
},
{
  path: "/admin/login",
  name: "AdminLogin",
  component: AdminLogin,
  meta: {
    guestOnly: true
  }
},
{
  path: "/admin/dashboard",
  name: "AdminDashboard",
  component: AdminDashboard,
  meta: {
    requiresAdmin: true
  }
},
{
  path: "/admin/vacancies",
  name: "AdminVacancies",
  component: AdminVacancies,
  meta: {
    requiresAdmin: true
  }
},
{
  path: "/admin/applications",
  name: "AdminApplications",
  component: AdminApplications,
  meta: {
    requiresAdmin: true
  }
},
{
  path: "/admin/pest-bookings",
  name: "AdminPestBookings",
 component: AdminPestBookings,
  meta: {
    requiresAdmin: true
  }
},{
  path: "/admin/contact-enquiries",
  name: "AdminContactEnquiries",
  component: AdminContactEnquiries,
  meta: {
    requiresAdmin: true
  }
},{
  path: "/admin/loan-applications",
  name: "AdminLoanApplications",
  component: AdminLoanApplications,
  meta: {
    requiresAdmin: true
  }
},

// Page not found
{
  path: "/:pathMatch(.*)*",
  redirect: "/"
}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return {
      top: 0
    };
  }
});

const getCurrentUser = () => {
  return new Promise((resolve) => {
    const removeListener = onAuthStateChanged(
      auth,
      (user) => {
        removeListener();
        resolve(user);
      }
    );
  });
};

router.beforeEach(async (to) => {
  const currentUser = await getCurrentUser();

  if (to.meta.requiresAdmin) {
    if (!currentUser) {
      return {
        name: "AdminLogin",
        query: {
          redirect: to.fullPath
        }
      };
    }

    if (currentUser.uid !== ADMIN_UID) {
      return {
        name: "Home"
      };
    }
  }

  if (
    to.meta.guestOnly &&
    currentUser &&
    currentUser.uid === ADMIN_UID
  ) {
    return {
      name: "AdminDashboard"
    };
  }

  return true;
});

export default router;