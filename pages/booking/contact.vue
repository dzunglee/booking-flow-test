<template>
  <div class="contact-info-page">
    <BookingSteps :current-step="3" />

    <div class="booking-flow-container">
      <div class="contact-form-section">
        <form @submit.prevent="handleSubmit" class="contact-form">
          <div class="form-section">
            <h3>Contact Information</h3>

            <div class="form-row">
              <div class="form-group">
                <label for="title" class="form-label">Title *</label>
                <select id="title" v-model="contactForm.title" class="form-select" :class="{ 'form-select-error': errors.title }" required>
                  <option value="mr">Mr.</option>
                  <option value="ms">Ms.</option>
                </select>
                <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
              </div>

              <div class="form-group">
                <label for="name" class="form-label">Last Name *</label>
                <input type="text" id="name" v-model="contactForm.name" class="form-input" :class="{ 'form-input-error': errors.name }" required />
                <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="email" class="form-label">Email Address *</label>
                <input type="email" id="email" v-model="contactForm.email" class="form-input" :class="{ 'form-input-error': errors.email }" required />
                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
              </div>

              <div class="form-group">
                <label for="phone" class="form-label">Phone Number *</label>
                <input type="tel" id="phone" v-model="contactForm.phone" class="form-input" :class="{ 'form-input-error': errors.phone }" placeholder="" required />
                <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Special Requests</h3>
            <div class="form-group">
              <label for="specialRequests" class="form-label">Special Requests (Optional)</label>
              <textarea id="specialRequests" v-model="contactForm.specialRequests" class="form-textarea" rows="4" placeholder="Any special requests or notes for your stay..."></textarea>
            </div>
          </div>

          <div v-if="submitError" class="error-message general-error">
            {{ submitError }}
          </div>

          <div class="form-actions">
            <button type="button" @click="goBack" class="back-button">← Back to Rooms</button>
            <button type="submit" class="submit-button" :disabled="!isFormValid || submitting">
              {{ submitting ? 'Processing...' : 'Complete Booking' }}
            </button>
          </div>
        </form>
      </div>

      <div class="booking-summary">
        <div v-if="roomLoading" class="loading">Loading room details...</div>
        <div v-else-if="selectedRoom">
          <h3 v-if="searchParams.checkin && searchParams.checkout">{{ formatDate(searchParams.checkin) }} - {{ formatDate(searchParams.checkout) }}</h3>
          <h4>{{ selectedRoom.name }}</h4>

          <div class="room-summary">
            <div class="room-image">
              <img :src="selectedRoom.image" :alt="selectedRoom.name" />
            </div>
          </div>

          <div class="stay-details">
            <div class="detail-row">
              <span>Guests:</span>
              <span>{{ searchParams.guests }} guest{{ Number(searchParams.guests) > 1 ? 's' : '' }}</span>
            </div>
            <div class="detail-row">
              <span>Nights:</span>
              <span>{{ nights }} night{{ nights > 1 ? 's' : '' }}</span>
            </div>
            <div class="detail-row">
              <span>Room ({{ nights }} nights):</span>
              <span>${{ subtotal }}</span>
            </div>
            <div class="detail-row">
              <span>Taxes & Fees(10%):</span>
              <span>${{ taxes }}</span>
            </div>
            <div class="detail-row total">
              <span><strong>Total Amount:</strong></span>
              <span
                ><strong>${{ total }}</strong></span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const route = useRoute()
const router = useRouter()

const searchParams = computed(() => ({
  roomId: (route.query.roomId as string) || '',
  location: (route.query.location as string) || '',
  checkin: (route.query.checkin as string) || '',
  checkout: (route.query.checkout as string) || '',
  guests: (route.query.guests as string) || '2',
  type: (route.query.type as string) || '',
}))

const selectedRoom = ref(null)
const roomLoading = ref(true)

const nights = computed(() => {
  if (!searchParams.value.checkin || !searchParams.value.checkout) return 0
  const checkin = new Date(searchParams.value.checkin)
  const checkout = new Date(searchParams.value.checkout)
  return Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24))
})

const subtotal = computed(() => {
  if (!selectedRoom.value) return 0
  return selectedRoom.value.price * nights.value
})

const taxes = computed(() => Math.round(subtotal.value * 0.12))
const total = computed(() => subtotal.value + taxes.value)

const contactForm = reactive({
  title: 'mr',
  name: '',
  email: '',
  phone: '',
  specialRequests: '',
})

const errors = reactive({
  title: '',
  name: '',
  email: '',
  phone: '',
})

const isFormValid = computed(() => {
  return contactForm.name && contactForm.email && contactForm.phone
})

const submitting = ref(false)
const submitError = ref('')

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = ''
  })
}

const validateForm = () => {
  clearErrors()
  let isValid = true

  if (!contactForm.name.trim()) {
    errors.name = 'Last name is required'
    isValid = false
  }

  if (!contactForm.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^\S+@\S+\.\S+$/.test(contactForm.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  if (!contactForm.phone.trim()) {
    errors.phone = 'Phone number is required'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true
  submitError.value = ''

  try {
    const bookingData = {
      room: selectedRoom.value,
      searchParams: searchParams.value,
      contactInfo: contactForm,
      pricing: {
        subtotal: subtotal.value,
        taxes: taxes.value,
        total: total.value,
        nights: nights.value,
      },
    }

    const res: any = await $fetch('/api/bookings', {
      method: 'POST',
      body: bookingData,
    })
    const { data } = res
    if (data.success) {
      await navigateTo(`/booking/confirmation?bookingId=${data.bookingId}`)
    } else {
      submitError.value = data.error || 'Booking failed. Please try again.'
    }
  } catch (error: any) {
    submitError.value = error.data?.message || 'Booking failed. Please try again.'
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.back()
}

const fetchRoomData = async () => {
  if (!searchParams.value.roomId) {
    navigateTo('/booking')
    return
  }

  try {
    roomLoading.value = true
    const response: any = await $fetch(`/api/rooms/${searchParams.value.roomId}`)
    selectedRoom.value = response.data.room
  } catch (error) {
    console.error('Error fetching room:', error)
    navigateTo('/booking')
  } finally {
    roomLoading.value = false
  }
}

onMounted(() => {
  fetchRoomData()
})
</script>

<style scoped>
.contact-info-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.booking-flow-container {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  align-items: start;
}

.booking-summary {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  position: sticky;
  top: 100px;
}

.booking-summary h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  margin-top: 0;
  font-size: 1.5rem;
}

.booking-summary h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  margin-top: 0;
  font-size: 1.25rem;
}

.room-summary {
  margin-bottom: 1.5rem;
}

.room-image {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.room-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.loading {
  text-align: center;
  color: #6c757d;
  padding: 2rem;
}

.stay-details {
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.detail-row.total {
  padding-top: 0.5rem;
  border-top: 1px solid #e9ecef;
  font-size: 1rem;
}

.contact-form-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
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

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background-color: white;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #2c3e50;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-input-error,
.form-select-error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.general-error {
  background-color: #f8d7da;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 2rem;
}

.back-button {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: #5a6268;
}

.submit-button {
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  max-width: 300px;
}

.submit-button:hover:not(:disabled) {
  background-color: #34495e;
}

.submit-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

@media (max-width: 992px) {
  .booking-flow-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .booking-summary {
    position: static;
    order: 2;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-button {
    max-width: none;
  }
}
</style>
