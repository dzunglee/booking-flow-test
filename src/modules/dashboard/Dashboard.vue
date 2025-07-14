<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <h1>My Dashboard</h1>
      <p>Welcome back, {{ user?.name }}! Manage your bookings here.</p>
    </div>

    <div class="dashboard-tabs">
      <button @click="activeTab = 'upcoming'" :class="['tab-button', { active: activeTab === 'upcoming' }]">Upcoming Bookings ({{ upcomingBookings.length }})</button>
      <button @click="activeTab = 'past'" :class="['tab-button', { active: activeTab === 'past' }]">Past Bookings ({{ pastBookings.length }})</button>
    </div>

    <div class="bookings-section">
      <div v-if="activeTab === 'upcoming'" class="bookings-list">
        <div v-if="upcomingBookings.length === 0" class="no-bookings">
          <h3>No upcoming bookings</h3>
          <p>You don't have any upcoming reservations.</p>
          <router-link to="/" class="book-now-btn">Book a Room</router-link>
        </div>

        <div v-else>
          <div v-for="booking in upcomingBookings" :key="booking.id" class="booking-card">
            <div class="booking-details">
              <div class="booking-info">
                <h3 class="room-name">{{ booking.room.name }}</h3>
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
                <img width="210" :src="booking.room.image" :alt="booking.room.name" />
              </div>
            </div>

            <div class="booking-actions">
              <button @click="viewBooking(booking)" class="action-btn view-btn">View Details</button>
              <button @click="cancelBooking(booking)" class="action-btn cancel-btn" :disabled="!canCancelBooking(booking)">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'past'" class="bookings-list">
        <div v-if="pastBookings.length === 0" class="no-bookings">
          <h3>No past bookings</h3>
          <p>You haven't made any bookings yet.</p>
          <router-link to="/" class="book-now-btn">Book Your First Room</router-link>
        </div>

        <div v-else>
          <div v-for="booking in pastBookings" :key="booking.id" class="booking-card">
            <div class="booking-details">
              <div class="booking-info">
                <h3 class="room-name">{{ booking.room.name }}</h3>
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
                <img width="210" :src="booking.room.image" :alt="booking.room.name" />
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

    <div v-if="selectedBooking" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Booking Details</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div class="detail-section">
            <h3>Room Information</h3>
            <p><strong>Room:</strong> {{ selectedBooking.room.name }}</p>
            <p><strong>Type:</strong> {{ selectedBooking.room.type }}</p>
            <p><strong>Size:</strong> {{ selectedBooking.room.size }} m²</p>
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
            <h3>Contact Information</h3>
            <p><strong>Name:</strong> {{ selectedBooking.guestInfo.firstName }} {{ selectedBooking.guestInfo.lastName }}</p>
            <p><strong>Email:</strong> {{ selectedBooking.guestInfo.email }}</p>
            <p><strong>Phone:</strong> {{ selectedBooking.guestInfo.phone }}</p>
          </div>

          <div class="detail-section">
            <h3>Payment Summary</h3>
            <p><strong>Room Rate:</strong> ${{ selectedBooking.room.price }} per night</p>
            <p><strong>Nights:</strong> {{ calculateNights(selectedBooking) }}</p>
            <p><strong>Subtotal:</strong> ${{ selectedBooking.subtotal }}</p>
            <p><strong>Taxes & Fees:</strong> ${{ selectedBooking.taxes }}</p>
            <p><strong>Total Amount:</strong> ${{ selectedBooking.totalAmount }}</p>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="action-btn view-btn">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const activeTab = ref('upcoming')
const selectedBooking = ref<any>(null)

const bookings = ref<any[]>([])

const loadBookings = () => {
  try {
    const savedBookings = localStorage.getItem('bookings')
    let userBookings = []

    if (savedBookings) {
      const parsedBookings = JSON.parse(savedBookings)
      userBookings = parsedBookings.map((booking: any) => ({
        ...booking,
        guestInfo: {
          firstName: booking.contact?.firstName || booking.contact?.name || 'Guest',
          lastName: booking.contact?.lastName || '',
          email: booking.contact?.email || '',
          phone: booking.contact?.phone || '',
        },
      }))
    }

    const mockPastBookings = getMockPastBookings().map((booking: any) => ({
      ...booking,
      guestInfo: {
        firstName: booking.contact?.firstName || 'Guest',
        lastName: booking.contact?.lastName || '',
        email: booking.contact?.email || '',
        phone: booking.contact?.phone || '',
      },
    }))

    bookings.value = [...userBookings, ...mockPastBookings]
  } catch (error) {
    console.error('Error loading bookings from localStorage:', error)
    bookings.value = getMockPastBookings().map((booking: any) => ({
      ...booking,
      guestInfo: {
        firstName: booking.contact?.firstName || 'Guest',
        lastName: booking.contact?.lastName || '',
        email: booking.contact?.email || '',
        phone: booking.contact?.phone || '',
      },
    }))
  }
}

const upcomingBookings = computed(() => {
  const today = new Date()
  return bookings.value.filter((booking) => new Date(booking.checkinDate) >= today && booking.status !== 'Cancelled')
})

const pastBookings = computed(() => {
  const today = new Date()
  return bookings.value.filter((booking) => new Date(booking.checkoutDate) < today || booking.status === 'Completed')
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

const cancelBooking = async (booking: any) => {
  if (!canCancelBooking(booking)) return

  if (confirm(`Are you sure you want to cancel booking #${booking.confirmationNumber}?`)) {
    booking.status = 'Cancelled'

    try {
      const savedBookings = localStorage.getItem('bookings')
      if (savedBookings) {
        const allBookings = JSON.parse(savedBookings)
        const updatedBookings = allBookings.map((b: any) => (b.confirmationNumber === booking.confirmationNumber ? { ...b, status: 'Cancelled' } : b))
        localStorage.setItem('bookings', JSON.stringify(updatedBookings))
      }
    } catch (error) {
      console.error('Error updating booking in localStorage:', error)
    }

    alert('Booking cancelled successfully!')
  }
}

const bookAgain = (booking: any) => {
  router.push({
    name: 'rooms',
    query: {
      guests: booking.guests.toString(),
      type: booking.room.type.toLowerCase(),
    },
  })
}

const getMockPastBookings = () => [
  {
    id: 1001,
    confirmationNumber: 'HTL001235',
    checkinDate: '2024-12-20',
    checkoutDate: '2024-12-23',
    guests: 4,
    status: 'Completed',
    totalAmount: 567,
    subtotal: 525,
    taxes: 42,
    room: {
      id: 3,
      name: 'Deluxe Room 1',
      type: 'Deluxe',
      price: 299,
      size: 45,
      image: 'https://placehold.co/340x210',
    },
    contact: {
      firstName: 'Dung',
      lastName: 'Le',
      email: 'mail@gmail.com',
      phone: '0352253714',
    },
    createdAt: '2024-12-15T10:30:00.000Z',
  },
  {
    id: 1002,
    confirmationNumber: 'HTL001236',
    checkinDate: '2024-12-25',
    checkoutDate: '2024-12-28',
    guests: 3,
    status: 'Completed',
    totalAmount: 456,
    subtotal: 408,
    taxes: 48,
    room: {
      id: 4,
      name: 'Standard Room 1',
      type: 'Standard',
      price: 199,
      size: 35,
      image: 'https://placehold.co/340x210',
    },
    contact: {
      firstName: 'Dung',
      lastName: 'Le',
      email: 'mail@gmail.com',
      phone: '0352253714',
    },
    createdAt: '2024-12-15T10:30:00.000Z',
  },
]

onMounted(() => {
  loadBookings()

  window.addEventListener('storage', (e) => {
    if (e.key === 'bookings') {
      loadBookings()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('storage', loadBookings)
})
</script>

<style scoped>
.dashboard-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
}

.dashboard-header {
  margin-bottom: 2rem;
  text-align: center;
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

.cancel-btn {
  background-color: #dc3545;
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.cancel-btn:disabled {
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
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
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
