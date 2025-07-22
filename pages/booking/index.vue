<template>
  <div class="room-search-page">
    <!-- <BookingSteps :current-step="1" /> -->

    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Find Your Room</h1>
      </div>
    </section>

    <section class="search-section">
      <div class="search-container">
        <h2>Search Available Rooms</h2>
        <form @submit.prevent="handleSearch" class="search-form">
          <div class="form-row">
            <div class="form-group">
              <label for="checkin" class="form-label">Check-in Date</label>
              <input type="date" id="checkin" v-model="searchForm.checkin" class="form-input" :min="minDate" required />
            </div>

            <div class="form-group">
              <label for="checkout" class="form-label">Check-out Date</label>
              <input type="date" id="checkout" v-model="searchForm.checkout" class="form-input" :min="minCheckout" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="guests" class="form-label">Number of Guests</label>
              <select id="guests" v-model="searchForm.guests" class="form-input" required>
                <option value="">Select guests</option>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5+ Guests</option>
              </select>
            </div>

            <div class="form-group">
              <label for="roomType" class="form-label">Room Type</label>
              <select id="roomType" v-model="searchForm.roomType" class="form-input">
                <option value="">Any Type</option>
                <option value="single">Single Room</option>
                <option value="double">Double Room</option>
                <option value="suite">Suite</option>
                <option value="deluxe">Deluxe Room</option>
              </select>
            </div>
          </div>

          <button type="submit" class="search-button" :disabled="pending || !isFormValid">
            <span v-if="pending">Searching...</span>
            <span v-else>Search Rooms</span>
          </button>
        </form>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const route = useRoute()
const minDate = new Date().toISOString().split('T')[0]

const searchForm = reactive({
  checkin: (route.query.checkin as string) || '',
  checkout: (route.query.checkout as string) || '',
  guests: (route.query.guests as string) || '',
  roomType: (route.query.type as string) || '',
})

const pending = ref(false)
const error = ref('')

const minCheckout = computed(() => {
  if (searchForm.checkin) {
    const checkinDate = new Date(searchForm.checkin)
    checkinDate.setDate(checkinDate.getDate() + 1)
    return checkinDate.toISOString().split('T')[0]
  }
  return minDate
})

const isFormValid = computed(() => {
  return searchForm.checkin && searchForm.checkout && searchForm.guests && new Date(searchForm.checkout) > new Date(searchForm.checkin)
})

const handleSearch = async () => {
  if (!isFormValid.value) return

  pending.value = true
  error.value = ''

  try {
    await navigateTo({
      path: '/booking/rooms',
      query: {
        checkin: searchForm.checkin,
        checkout: searchForm.checkout,
        guests: searchForm.guests,
        type: searchForm.roomType,
      },
    })
  } catch (err: any) {
    error.value = err.message || 'Search failed. Please try again.'
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.room-search-page {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(rgba(44, 62, 80, 0.7), rgba(44, 62, 80, 0.7));
  background-size: cover;
  background-position: center;
  padding: 80px 0;
  color: white;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.search-section {
  padding: 60px 0;
  background-color: #f8f9fa;
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.search-container h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
  font-size: 2rem;
}

.search-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background-color: white;
}

.form-input:focus {
  outline: none;
  border-color: #2c3e50;
}

.search-button {
  width: 100%;
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.search-button:hover:not(:disabled) {
  background-color: #34495e;
  transform: translateY(-2px);
}

.search-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .search-form {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 60px 0;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .search-section {
    padding: 40px 0;
  }
}
</style>
