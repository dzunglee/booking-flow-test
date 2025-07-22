<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <p class="welcome-message">Welcome back, {{ user?.name }}! Manage your bookings here.</p>
    </div>

    <div class="dashboard-tabs">
      <button @click="activeTab = 'upcoming'" :class="['tab-button', { active: activeTab === 'upcoming' }]">Upcoming Bookings ({{ upcomingBookings.length }})</button>
      <button @click="activeTab = 'past'" :class="['tab-button', { active: activeTab === 'past' }]">Past Bookings ({{ pastBookings.length }})</button>
    </div>

    <div class="bookings-section">
      <div class="loading-spinner" v-if="loading"><DotLoader /></div>
      <div v-else-if="activeTab === 'upcoming'" class="bookings-list">
        <div v-if="upcomingBookings.length === 0" class="no-bookings">
          <h3>No upcoming bookings</h3>
          <p>You don't have any upcoming reservations.</p>
          <NuxtLink to="/rooms" class="book-now-btn">Book a Room</NuxtLink>
        </div>

        <div v-else>
          <div v-for="booking in upcomingBookings" :key="booking.id" class="booking-card">
            <div class="booking-details">
              <div class="booking-info">
                <h3 class="room-name">{{ booking.room?.name || 'Room' }}</h3>
                <p class="booking-dates">
                  <strong>Check-in:</strong> {{ formatDate(booking.checkinDate) }} <br />
                  <strong>Check-out:</strong> {{ formatDate(booking.checkoutDate) }}
                </p>
                <p class="booking-guests"><strong>Guests:</strong> {{ booking.guests }} guest{{ booking.guests > 1 ? 's' : '' }}</p>
                <p class="booking-total"><strong>Total:</strong> ${{ booking.totalAmount }}</p>
              </div>

              <div class="booking-status">
                <span :class="['status-badge', booking.status.toLowerCase()]">
                  {{ booking.status }}
                </span>
                <p class="booking-number">Booking #{{ booking.confirmationNumber }}</p>
                <img width="210" :src="booking.room?.image || 'https://placehold.co/340x210'" :alt="booking.room?.name || 'Room'" />
              </div>
            </div>

            <div class="booking-actions">
              <button @click="viewBooking(booking)" class="action-btn view-btn">View Details</button>
              <button @click="openConfirmModal(booking)" class="action-btn cancel-btn" :disabled="!canCancelBooking(booking)">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'past'" class="bookings-list">
        <div v-if="pastBookings.length === 0" class="no-bookings">
          <h3>No past bookings</h3>
          <p>You haven't made any bookings yet.</p>
          <NuxtLink to="/rooms" class="book-now-btn">Book Your First Room</NuxtLink>
        </div>

        <div v-else>
          <div v-for="booking in pastBookings" :key="booking.id" class="booking-card">
            <div class="booking-details">
              <div class="booking-info">
                <h3 class="room-name">{{ booking.room?.name || 'Room' }}</h3>
                <p class="booking-dates">
                  <strong>Check-in:</strong> {{ formatDate(booking.checkinDate) }} <br />
                  <strong>Check-out:</strong> {{ formatDate(booking.checkoutDate) }}
                </p>
                <p class="booking-guests"><strong>Guests:</strong> {{ booking.guests }} guest{{ booking.guests > 1 ? 's' : '' }}</p>
                <p class="booking-total"><strong>Total:</strong> ${{ booking.totalAmount }}</p>
              </div>

              <div class="booking-status">
                <span :class="['status-badge', booking.status.toLowerCase()]">
                  {{ booking.status }}
                </span>
                <p class="booking-number">Booking #{{ booking.confirmationNumber }}</p>
                <img width="210" :src="booking.room?.image || '/placeholder-room.jpg'" :alt="booking.room?.name || 'Room'" />
              </div>
            </div>

            <div class="booking-actions">
              <button @click="viewBooking(booking)" class="action-btn view-btn">View Details</button>
              <button @click="bookAgain(booking)" class="action-btn book-again-btn">Book Again</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Booking Details -->
    <Transition>
      <div v-if="selectedBooking" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Booking Details</h2>
            <button @click="closeModal" class="close-btn">&times;</button>
          </div>

          <div class="modal-body">
            <div class="detail-container">
              <div class="detail-section">
                <h3>Room Information</h3>
                <p><strong>Room:</strong> {{ selectedBooking.room?.name || 'Room' }}</p>
                <p><strong>Type:</strong> {{ selectedBooking.room?.type || 'N/A' }}</p>
                <p><strong>Size:</strong> {{ selectedBooking.room?.size || 'N/A' }} m²</p>
              </div>

              <div class="detail-section">
                <h3>Contact Information</h3>
                <p><strong>Name:</strong> {{ selectedBooking.guestInfo?.firstName || 'Guest' }} {{ selectedBooking.guestInfo?.lastName || '' }}</p>
                <p><strong>Email:</strong> {{ selectedBooking.guestInfo?.email || 'N/A' }}</p>
                <p><strong>Phone:</strong> {{ selectedBooking.guestInfo?.phone || 'N/A' }}</p>
              </div>

              <div class="detail-section">
                <h3>Booking Information</h3>
                <p><strong>Confirmation Number:</strong> {{ selectedBooking.confirmationNumber }}</p>
                <p><strong>Check-in:</strong> {{ formatDate(selectedBooking.checkinDate) }}</p>
                <p><strong>Check-out:</strong> {{ formatDate(selectedBooking.checkoutDate) }}</p>
                <p><strong>Guests:</strong> {{ selectedBooking.guests }}</p>
                <p><strong>Status:</strong> {{ selectedBooking.status }}</p>
              </div>

              <div class="detail-section">
                <h3>Payment Summary</h3>
                <p><strong>Room Rate:</strong> ${{ selectedBooking.room?.price || '0' }} per night</p>
                <p><strong>Nights:</strong> {{ calculateNights(selectedBooking) }}</p>
                <p><strong>Subtotal:</strong> ${{ selectedBooking.subtotal || '0' }}</p>
                <p><strong>Taxes & Fees:</strong> ${{ selectedBooking.taxes || '0' }}</p>
                <p><strong>Total Amount:</strong> ${{ selectedBooking.totalAmount || '0' }}</p>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="action-btn view-btn">Close</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal for Cancel Confirmation -->
    <Transition>
      <div v-if="selectedCancelBooking" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Confirmation</h2>
            <button @click="closeConfirmModal" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <h2>Are you sure?</h2>
            <p>This action cannot be undone. Are you sure you want to cancel this booking?</p>
          </div>

          <div class="modal-footer">
            <button @click="closeConfirmModal" class="action-btn view-btn">Close</button>
            <button @click="cancelBooking" class="action-btn delete-btn">{{ cancelLoading ? 'Canceling...' : 'Cancel Booking' }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Success Toast -->
    <Transition name="notification">
      <div v-if="isShowSuccessToast" class="notification">Booking cancelled successfully!</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Booking } from '~/src/stores/booking'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const { data: sessionData } = await $fetch('/api/auth/me')
const user = sessionData?.user

const activeTab = ref('upcoming')
const selectedBooking = ref<any>(null)
const selectedCancelBooking = ref<any>(null)
const isShowSuccessToast = ref(false)
const loading = ref(true)
const cancelLoading = ref(false)
const bookings = ref<Booking[]>([])

const loadBookings = async () => {
  loading.value = true
  try {
    const response: any = await $fetch('/api/bookings')
    if (response.success) {
      bookings.value = (response.data.bookings as Booking[]) || []
    }
  } catch (error) {
    console.error('Error loading bookings:', error)
    bookings.value = []
  } finally {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    loading.value = false
  }
}

const upcomingBookings = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return bookings.value.filter((booking: Booking) => new Date(booking.checkinDate) >= today && booking.status !== 'Cancelled')
})

const pastBookings = computed(() => {
  const today = new Date()
  return bookings.value.filter((booking: Booking) => new Date(booking.checkoutDate) < today || booking.status === 'Completed')
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const calculateNights = (booking: any) => {
  const checkin = new Date(booking.checkinDate)
  const checkout = new Date(booking.checkoutDate)
  const timeDiff = checkout.getTime() - checkin.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

const canCancelBooking = (booking: any) => {
  const checkinDate = new Date(booking.checkinDate)
  const today = new Date()
  const daysDiff = (checkinDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
  return daysDiff > 1 && booking.status === 'Confirmed'
}

const viewBooking = (booking: any) => {
  selectedBooking.value = booking
}

const closeModal = () => {
  selectedBooking.value = null
}

const openConfirmModal = (booking: any) => {
  selectedCancelBooking.value = booking
}

const closeConfirmModal = () => {
  selectedCancelBooking.value = null
}

const showSuccessToast = () => {
  isShowSuccessToast.value = true
  setTimeout(() => {
    isShowSuccessToast.value = false
  }, 3000)
}

const cancelBooking = async () => {
  const booking = selectedCancelBooking.value
  if (!canCancelBooking(booking)) return

  cancelLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    booking.status = 'Cancelled'

    selectedCancelBooking.value = null
    showSuccessToast()
  } catch (error) {
    console.error('Error cancelling booking:', error)
  } finally {
    cancelLoading.value = false
  }
}

const bookAgain = (booking: any) => {
  navigateTo({
    path: '/rooms',
    query: {
      guests: booking.guests.toString(),
      type: booking.room?.type?.toLowerCase(),
    },
  })
}

onMounted(() => {
  loadBookings()
})
</script>

<style scoped>
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.dashboard-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e9ecef;
}

.tab-button {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: #7f8c8d;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  border-radius: unset;
}

.tab-button.active {
  color: #2c3e50;
  border-bottom-color: #2c3e50;
}

.tab-button:hover {
  color: #2c3e50;
}

.bookings-section {
  min-height: 400px;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.booking-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr auto;
  transition: transform 0.3s ease;
  margin-bottom: 1.5rem;
}

.booking-card:hover {
  transform: translateY(-2px);
}

.booking-image {
  overflow: hidden;
}

.booking-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.booking-details {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.booking-info {
  flex: 1;
}

.room-name {
  color: #2c3e50;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.booking-dates,
.booking-guests,
.booking-total {
  margin-bottom: 0.5rem;
  color: #555;
  line-height: 1.5;
}

.booking-status {
  text-align: right;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.confirmed {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.completed {
  background-color: #cce5ff;
  color: #004085;
}

.status-badge.cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.booking-number {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.booking-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem;
  border-left: 1px solid #e9ecef;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.view-btn {
  background-color: #6c757d;
  color: white;
}

.view-btn:hover {
  background-color: #5a6268;
}

.cancel-btn,
.delete-btn {
  background-color: #dc3545;
  color: white;
}

.cancel-btn:hover:not(:disabled),
.delete-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.cancel-btn:disabled,
.delete-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.book-again-btn {
  background-color: #2c3e50;
  color: white;
}

.book-again-btn:hover {
  background-color: #34495e;
}

.no-bookings {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.no-bookings h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.book-now-btn {
  display: inline-block;
  background-color: #2c3e50;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  margin-top: 1rem;
  transition: background-color 0.3s ease;
}

.book-now-btn:hover {
  background-color: #34495e;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 750px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content .confirmation {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #2c3e50;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body h2 {
  margin: 0;
}

.detail-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h3 {
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
}

.detail-section p {
  margin-bottom: 0.5rem;
  color: #555;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
  text-align: right;
  display: flex;
  gap: 0.5rem;
  justify-content: end;
}

.notification {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #d4edda;
  color: #155724;
  border-radius: 8px;
  font-weight: 500;
  z-index: 1000;
}

.welcome-message {
  font-size: 1.5rem !important;
  font-weight: 500;
  margin-bottom: 1rem;
  color: black !important;
}

@media (max-width: 768px) {
  .dashboard-header h1 {
    font-size: 2rem;
  }

  .dashboard-tabs {
    flex-direction: column;
    gap: 0;
  }

  .tab-button {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e9ecef;
    border-right: none;
  }

  .booking-card {
    grid-template-columns: 1fr;
  }

  .booking-image {
    height: 150px;
  }

  .booking-actions {
    flex-direction: row;
    border-left: none;
    border-top: 1px solid #e9ecef;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}

@media (max-width: 480px) {
  .booking-details {
    flex-direction: column;
    gap: 1rem;
  }

  .booking-status {
    text-align: left;
  }

  .booking-actions {
    flex-direction: column;
  }
}
</style>
