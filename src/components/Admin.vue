<template>
  <div class="admin-page">
    <nav class="topbar">
      <router-link to="/" class="brand">RMC Admin</router-link>
      <router-link to="/contact" class="back-link">Back to site</router-link>
    </nav>

    <main class="content">
      <h1>Submission Dashboard</h1>
      <p>All form submissions are stored in the local database.</p>

      <div v-if="loading" class="status">Loading submissions...</div>

      <div v-else class="grid">
        <section class="panel">
          <h2>Contact enquiries</h2>
          <div v-if="submissions.contacts.length" class="list">
            <article v-for="item in submissions.contacts" :key="item.id" class="item">
              <strong>{{ item.name }}</strong>
              <p>{{ item.email }}</p>
              <p>{{ item.service || 'General' }}</p>
              <small>{{ item.created_at }}</small>
            </article>
          </div>
          <p v-else>No contact enquiries yet.</p>
        </section>

        <section class="panel">
          <h2>Recruitment applications</h2>
          <div v-if="submissions.recruitment.length" class="list">
            <article v-for="item in submissions.recruitment" :key="item.id" class="item">
              <strong>{{ item.name }}</strong>
              <p>{{ item.email }}</p>
              <p>{{ item.position || 'Not specified' }}</p>
              <small>{{ item.created_at }}</small>
            </article>
          </div>
          <p v-else>No recruitment applications yet.</p>
        </section>

        <section class="panel">
          <h2>Pest bookings</h2>
          <div v-if="submissions.bookings.length" class="list">
            <article v-for="item in submissions.bookings" :key="item.id" class="item">
              <strong>{{ item.name }}</strong>
              <p>{{ item.address }}</p>
              <p>{{ item.date }} at {{ item.time }}</p>
              <small>{{ item.created_at }}</small>
            </article>
          </div>
          <p v-else>No pest bookings yet.</p>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const submissions = ref({ contacts: [], recruitment: [], bookings: [] });
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await fetch('/api/admin/submissions');
    const data = await response.json();
    submissions.value = data;
  } catch (error) {
    console.error('Could not load submissions', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f5f7fb;
  color: #1f2937;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: #111827;
  color: #fff;
}

.brand,
.back-link {
  color: #fff;
  text-decoration: none;
  font-weight: 700;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.panel {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
}

.status {
  color: #0f766e;
  font-weight: 600;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
