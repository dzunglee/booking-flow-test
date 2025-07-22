<template>
  <div class="confirmation-page">
    <div v-if="loading" class="loading-spinner">
      <DotLoader />
    </div>

    <div v-else-if="bookingData">
      <div class="success-header">
        <div class="success-icon">✅</div>
        <h1>Your booking has been confirmed!</h1>
        <p class="confirmation-message">
          We have sent your booking confirmation to the email address that you have provided. <br />
          Check-in/Check-out: {{ formatDate(bookingData?.checkinDate) }} → {{ formatDate(bookingData?.checkoutDate) }} <br />
          Booking Confirmation Number: {{ bookingData?.confirmationNumber }} <br />
          Total Price for {{ calculateNights() }} Night{{ calculateNights() === 1 ? '' : 's' }}: S${{ bookingData?.totalAmount }}
        </p>

        <NuxtLink to="/dashboard">
          <button class="goto-dashboard-btn">Go to dashboard</button>
        </NuxtLink>
      </div>
      <div class="confirmation-container">
        <div class="booking-details">
          <div class="booking-overview">
            <div class="room-confirmation">
              <div class="room-image" v-if="bookingData?.room">
                <img :src="bookingData.room.image" :alt="bookingData.room.name" />
              </div>

              <div class="room-info">
                <h2>{{ bookingData?.room?.name }}</h2>
                <p class="room-type">{{ bookingData?.room?.type }}</p>
                <p class="room-details">{{ bookingData?.room?.size }} m² • Up to {{ bookingData?.room?.maxGuests }} guests</p>
              </div>
            </div>
          </div>
          <div class="payment-summary">
            <h3>Payment Summary</h3>
            <div class="payment-details">
              <div class="payment-row">
                <span>Room Rate ({{ calculateNights() }} nights):</span>
                <span>${{ bookingData?.subtotal }}</span>
              </div>
              <div class="payment-row">
                <span>Taxes & Fees (10%):</span>
                <span>${{ bookingData?.taxes }}</span>
              </div>
              <div class="payment-row total">
                <span><strong>Total Price:</strong></span>
                <span
                  ><strong>${{ bookingData?.totalAmount }}</strong></span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="guest-info-section">
          <h3>Guest Details</h3>
          <div class="guest-details">
            <p><strong>Name:</strong> {{ bookingData?.guestInfo?.firstName || bookingData?.contactInfo?.firstName }} {{ bookingData?.guestInfo?.lastName || bookingData?.contactInfo?.lastName }}</p>
            <p><strong>Email:</strong> {{ bookingData?.guestInfo?.email || bookingData?.contactInfo?.email }}</p>
            <p><strong>Phone:</strong> {{ bookingData?.guestInfo?.phone || bookingData?.contactInfo?.phone }}</p>
            <p v-if="bookingData?.guestInfo?.specialRequests || bookingData?.contactInfo?.specialRequests"><strong>Special Requests:</strong> {{ bookingData.guestInfo?.specialRequests || bookingData.contactInfo?.specialRequests }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error-state">
      <h2>Booking Not Found</h2>
      <p>We couldn't find your booking confirmation. Please check your booking reference.</p>
      <NuxtLink to="/booking" class="btn btn-primary"> Make a New Booking </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const route = useRoute()

const bookingId = route.query.bookingId as string
const loading = ref(true)
const bookingData = ref<any>(null)
const error = ref('')

const loadBookingData = async () => {
  loading.value = true
  error.value = ''

  try {
    if (!bookingId) {
      error.value = 'No booking ID provided'
      return
    }

    const response: any = await $fetch('/api/bookings')
    if (response.success && response.data.bookings) {
      const booking = response.data.bookings.find((b: any) => b.id.toString() === bookingId)

      if (booking) {
        bookingData.value = booking
      } else {
        error.value = 'Booking not found'
      }
    } else {
      error.value = 'Failed to load booking'
    }
  } catch (err: any) {
    console.error('Error loading booking:', err)
    error.value = 'Failed to load booking details'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadBookingData()
})

watch(
  () => route.query.bookingId,
  () => {
    if (route.query.bookingId) {
      loadBookingData()
    }
  },
  { immediate: true },
)

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
  if (!bookingData.value?.checkinDate || !bookingData.value?.checkoutDate) return 0
  const checkin = new Date(bookingData.value.checkinDate)
  const checkout = new Date(bookingData.value.checkoutDate)
  const timeDiff = checkout.getTime() - checkin.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}
</script>

<style scoped>
.confirmation-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
.confirmation-container {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  align-items: start;
}

.success-header {
  text-align: center;
  padding: 3rem 2rem;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.success-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.confirmation-message {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.booking-details {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.booking-overview {
  margin-bottom: 2rem;
}

.room-confirmation {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.room-image {
  width: 180px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.room-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-info h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.room-type {
  color: #7f8c8d;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.room-details {
  color: #555;
  font-size: 0.9rem;
}

.stay-confirmation h3,
.guest-info-section h3,
.payment-summary h3,
.next-steps h3,
.important-info h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.stay-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.stay-item {
  text-align: center;
}

.stay-label {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.stay-value {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1rem;
}

.stay-time {
  color: #7f8c8d;
  font-size: 0.8rem;
  font-weight: 400;
  margin-top: 0.25rem;
}

.guest-info-section,
.payment-summary {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.guest-info-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  position: sticky;
  top: 100px;
}

.guest-details p {
  margin-bottom: 0.5rem;
  color: #555;
}

.payment-details {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #555;
}

.payment-row.total {
  padding-top: 0.75rem;
  border-top: 1px solid #dee2e6;
  color: #2c3e50;
  font-size: 1.1rem;
}

.goto-dashboard-btn {
  background-color: black;
  color: white;
  border: none;
  padding: 0.5rem 2rem;
  cursor: pointer;
}

.error-state {
  text-align: center;
  padding: 3rem;
  color: #e74c3c;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

@media (max-width: 768px) {
  .confirmation-page {
    padding: 0 0.5rem;
  }

  .confirmation-container {
    grid-template-columns: 1fr;
  }

  .success-header {
    padding: 2rem 1rem;
  }

  .success-header h1 {
    font-size: 2rem;
  }

  .booking-details {
    padding: 1.5rem;
  }

  .room-confirmation {
    flex-direction: column;
    gap: 1rem;
  }

  .room-image {
    width: 100%;
    height: 150px;
  }

  .stay-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .steps-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .action-buttons {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }

  .guest-info-section {
    position: static;
  }
}

@media (max-width: 480px) {
  .success-icon {
    font-size: 3rem;
  }

  .stay-grid {
    grid-template-columns: 1fr;
  }

  .step-item {
    padding: 1rem;
  }

  .step-icon {
    font-size: 2rem;
  }
}
</style>
