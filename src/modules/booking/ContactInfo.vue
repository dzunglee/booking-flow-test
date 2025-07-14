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

          <div class="form-actions">
            <button type="button" @click="goBack" class="back-button">← Back to Rooms</button>
            <button type="submit" class="submit-button" :disabled="!isFormValid || isSubmitting">
              {{ isSubmitting ? 'Processing...' : 'Complete Booking' }}
            </button>
          </div>
        </form>
      </div>
      <div class="booking-summary">
        <h3>{{ formatDate(bookingDetails.checkin) }} - {{ formatDate(bookingDetails.checkout) }}</h3>
        <h4 v-if="selectedRoom">{{ selectedRoom.name }}</h4>
        <div class="room-summary" v-if="selectedRoom">
          <div class="room-image">
            <img :src="selectedRoom.image" :alt="selectedRoom.name" />
          </div>
        </div>

        <div class="stay-details">
          <div class="detail-row">
            <span>Guests:</span>
            <span>{{ bookingDetails.guests }} guest{{ bookingDetails.guests > 1 ? 's' : '' }}</span>
          </div>
          <div class="detail-row">
            <span>Nights:</span>
            <span>{{ calculateNights() }} night{{ calculateNights() > 1 ? 's' : '' }}</span>
          </div>
          <div class="detail-row">
            <span>Room ({{ calculateNights() }} nights):</span>
            <span>${{ (selectedRoom?.price || 0) * calculateNights() }}</span>
          </div>
          <div class="detail-row">
            <span>Taxes & Fees(10%):</span>
            <span>${{ calculateTaxes() }}</span>
          </div>
          <div class="detail-row total">
            <span><strong>Total Amount:</strong></span>
            <span
              ><strong>${{ calculateTotal() }}</strong></span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { rooms as roomData } from '@/data/mocks'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BookingSteps from './components/BookingSteps.vue'

const route = useRoute()
const router = useRouter()

const mockRooms = ref(roomData)

const selectedRoom = ref<any>(null)
const isSubmitting = ref(false)

const bookingDetails = computed(() => ({
  checkin: route.query.checkin as string,
  checkout: route.query.checkout as string,
  guests: parseInt(route.query.guests as string) || 1,
  roomId: parseInt(route.query.roomId as string),
}))

const contactForm = ref({
  title: '',
  name: '',
  email: '',
  phone: '',
  specialRequests: '',
  newsletter: false,
  paymentMethod: 'credit',
  agreeTerms: false,
})

const errors = ref({
  title: '',
  name: '',
  email: '',
  phone: '',
})

const isFormValid = computed(() => {
  console.log('Is form valid:', errors.value)
  console.log('Is form valid:', contactForm.value)
  return contactForm.value.title && contactForm.value.name && contactForm.value.email && contactForm.value.phone && !Object.keys(errors.value).some((key) => errors.value[key as keyof typeof errors.value])
})

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const calculateNights = () => {
  if (!bookingDetails.value.checkin || !bookingDetails.value.checkout) return 0
  const checkin = new Date(bookingDetails.value.checkin)
  const checkout = new Date(bookingDetails.value.checkout)
  const timeDiff = checkout.getTime() - checkin.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

const calculateTaxes = () => {
  const subtotal = (selectedRoom.value?.price || 0) * calculateNights()
  return Math.round(subtotal * 0.1)
}

const calculateTotal = () => {
  const subtotal = (selectedRoom.value?.price || 0) * calculateNights()
  return subtotal + calculateTaxes()
}

const validateForm = () => {
  errors.value = {
    title: '',
    name: '',
    email: '',
    phone: '',
  }

  if (!contactForm.value.title.trim()) {
    errors.value.title = 'Title is required'
  }

  if (!contactForm.value.name.trim()) {
    errors.value.name = 'Last name is required'
  }

  if (!contactForm.value.email.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(contactForm.value.email)) {
    errors.value.email = 'Please enter a valid email address'
  }

  if (!contactForm.value.phone.trim()) {
    errors.value.phone = 'Phone number is required'
  } else if (!/^\d{10}$/.test(contactForm.value.phone)) {
    errors.value.phone = 'Please enter a valid 10-digit phone number'
  }

  return !Object.keys(errors.value).some((key) => errors.value[key as keyof typeof errors.value])
}

const handleSubmit = async () => {
  if (!validateForm() || !isFormValid.value) return

  isSubmitting.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const bookingData = {
      id: Date.now(),
      confirmationNumber: 'HTL' + Date.now().toString().slice(-6),
      checkinDate: bookingDetails.value.checkin,
      checkoutDate: bookingDetails.value.checkout,
      guests: bookingDetails.value.guests,
      status: 'Confirmed',
      totalAmount: calculateTotal(),
      subtotal: (selectedRoom.value?.price || 0) * calculateNights(),
      taxes: calculateTaxes(),
      room: selectedRoom.value,
      contact: contactForm.value,
      createdAt: new Date().toISOString(),
    }

    const allBooking = JSON.parse(localStorage.getItem('bookings') || '[]')
    allBooking.push(bookingData)
    localStorage.setItem('bookings', JSON.stringify(allBooking))
    router.push({
      name: 'confirmation',
      query: {
        booking: JSON.stringify(bookingData),
      },
    })
  } catch (error) {
    alert('An error occurred while processing your booking. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  router.push({
    name: 'rooms',
    query: {
      checkin: bookingDetails.value.checkin,
      checkout: bookingDetails.value.checkout,
      guests: bookingDetails.value.guests.toString(),
    },
  })
}

onMounted(() => {
  selectedRoom.value = mockRooms.value.find((room) => room.id === bookingDetails.value.roomId) || mockRooms.value[0]

  if (!bookingDetails.value.checkin || !bookingDetails.value.checkout) {
    router.push('/')
  }
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

.room-summary {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.room-image {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
  background-color: var(--color-gray);
}

.room-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-details h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.room-type {
  color: #7f8c8d;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.room-size {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.stay-details,
.price-breakdown {
  margin-bottom: 1.5rem;
}

.stay-details h4,
.price-breakdown h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
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
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f1f3f4;
}

.form-section h3 {
  font-size: 1.25rem;
  text-transform: uppercase;
}

.form-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.form-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
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
.form-textarea:focus {
  outline: none;
  border-color: #2c3e50;
}

.form-input-error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.checkbox-group,
.terms-section {
  margin-top: 1rem;
}

.checkbox-label,
.payment-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 0;
}

.checkbox-input,
.radio-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-text,
.radio-text {
  font-size: 0.95rem;
  color: #555;
}

.terms-link {
  color: #2c3e50;
  text-decoration: underline;
}

.terms-link:hover {
  color: #34495e;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.payment-option {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.payment-option:hover {
  border-color: #dee2e6;
}

.payment-option:has(.radio-input:checked) {
  border-color: #2c3e50;
  background-color: #f1f3f4;
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
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .contact-form-section {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-button {
    max-width: none;
  }
}

@media (max-width: 480px) {
  .contact-info-page {
    padding: 0 0.5rem;
  }

  .booking-summary,
  .contact-form-section {
    padding: 1rem;
  }

  .payment-option {
    padding: 0.75rem;
  }
}
</style>
