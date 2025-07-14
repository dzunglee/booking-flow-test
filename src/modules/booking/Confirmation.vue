<template>
  <div class="confirmation-page">
    <div class="success-header">
      <div class="success-icon">✅</div>
      <h1>Your booking has been confirmed!</h1>
      <p class="confirmation-message">
        We have sent your booking confirmation to the email address that you have provided. <br />
        Check-in/Check-out: {{ formatDate(bookingData?.checkinDate) }} → {{ formatDate(bookingData?.checkoutDate) }} <br />
        Booking Confirmation Number: {{ bookingData?.confirmationNumber }} <br />
        Total Price for {{ calculateNights() }} Night{{ calculateNights() === 1 ? '' : 's' }}: S${{ bookingData?.totalAmount }}
      </p>
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
          <p><strong>Name:</strong> {{ bookingData?.contact?.name }} {{ bookingData?.contact?.lastName }}</p>
          <p><strong>Email:</strong> {{ bookingData?.contact?.email }}</p>
          <p><strong>Phone:</strong> {{ bookingData?.contact?.phone }}</p>
          <p v-if="bookingData?.contact?.specialRequests"><strong>Special Requests:</strong> {{ bookingData.contact.specialRequests }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const bookingData = ref<any>(null)

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

onMounted(() => {
  const bookingQuery = route.query.booking as string

  if (bookingQuery) {
    try {
      bookingData.value = JSON.parse(bookingQuery)
    } catch (error) {
      console.error('Error parsing booking data:', error)
      router.push('/')
    }
  } else {
    router.push('/')
  }
})
</script>

<style scoped>
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

@media (max-width: 768px) {
  .confirmation-page {
    padding: 0 0.5rem;
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
