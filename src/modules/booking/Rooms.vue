<template>
  <div class="rooms-page">
    <BookingSteps :current-step="2" />
    <div class="page-header">
      <h1>Available Rooms</h1>
      <div class="search-summary" v-if="hasSearchParams">
        <p>
          <strong>{{ searchParams.guests }}</strong> guest(s) • <strong>{{ formatDate(searchParams.checkin) }}</strong> to
          <strong>{{ formatDate(searchParams.checkout) }}</strong>
          <span v-if="searchParams.type"> • {{ getRoomTypeLabel(searchParams.type) }}</span>
        </p>
        <button @click="modifySearch" class="modify-search-btn">Modify Search</button>
      </div>
    </div>

    <div class="filters-section">
      <div class="filters">
        <select v-model="filters.sortBy" class="filter-select" @change="filterRooms">
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="size">Room Size</option>
        </select>
      </div>
    </div>
    <div class="loading-spinner" v-if="loading"><DotLoader /></div>

    <div class="rooms-grid" v-if="!loading">
      <div v-for="room in filteredRooms" :key="room.id" class="room-card">
        <div class="room-image">
          <img :src="room.image" :alt="room.name" />
          <div class="room-badge">{{ room.type }}</div>
        </div>

        <div class="room-details">
          <h3 class="room-name">{{ room.name }}</h3>
          <p class="room-description">{{ room.description }}</p>

          <div class="room-features">
            <span class="feature" v-for="feature in room.features" :key="feature">
              {{ feature }}
            </span>
          </div>

          <div class="room-info">
            <div class="room-size">{{ room.size }} m²</div>
            <div class="room-capacity">Up to {{ room.maxGuests }} guests</div>
            <div class="room-rating">
              <span class="stars">{{ '★'.repeat(room.rating) }}{{ '☆'.repeat(5 - room.rating) }}</span>
              <span class="rating-text">({{ room.reviews }} reviews)</span>
            </div>
          </div>

          <div class="room-footer">
            <div class="room-price">
              <span class="price">${{ room.price }}</span>
              <span class="per-night">per night</span>
            </div>
            <button @click="selectRoom(room)" class="select-room-btn" :disabled="!isRoomAvailable(room)">
              {{ isRoomAvailable(room) ? 'Book Room' : 'Not Available' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && filteredRooms.length === 0" class="no-rooms">
      <h3>No rooms available</h3>
      <button @click="modifySearch" class="modify-search-btn">Modify Search</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import DotLoader from '@/components/DotLoader.vue'
import { rooms as roomsData } from '@/data/mocks'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BookingSteps from './components/BookingSteps.vue'

const route = useRoute()
const router = useRouter()

const rooms = ref(roomsData)

const loading = ref(false)
const filteredRooms = ref<any>([])

const filters = ref({
  sortBy: 'price-low',
  priceRange: '',
})

const searchParams = computed(() => ({
  checkin: route.query.checkin as string,
  checkout: route.query.checkout as string,
  guests: route.query.guests as string,
  type: route.query.type as string,
}))

const hasSearchParams = computed(() => {
  return searchParams.value.checkin && searchParams.value.checkout && searchParams.value.guests
})

const filterRooms = async () => {
  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 1000))
  loading.value = false
  let filtered = [...rooms.value]

  if (searchParams.value.guests) {
    const guestCount = parseInt(searchParams.value.guests)
    filtered = filtered.filter((room) => room.maxGuests >= guestCount)
  }

  if (searchParams.value.type) {
    filtered = filtered.filter((room) => room.type.toLowerCase() === searchParams.value.type.toLowerCase())
  }

  switch (filters.value.sortBy) {
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price)
      break
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating)
      break
    case 'size':
      filtered.sort((a, b) => b.size - a.size)
      break
  }

  filteredRooms.value = filtered
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getRoomTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    single: 'Single Room',
    double: 'Double Room',
    suite: 'Suite',
    deluxe: 'Deluxe Room',
  }
  return labels[type] || type
}

const isRoomAvailable = (room: any) => {
  return room.available
}

const modifySearch = () => {
  router.push('/')
}

const selectRoom = (room: any) => {
  console.log('🚀 ~ selectRoom ~ room:', room)
  if (!isRoomAvailable(room)) return

  router.push({
    name: 'contact',
    query: {
      roomId: room.id,
      ...searchParams.value,
    },
  })
}

const onOrderChange = () => {
  filterRooms()
}

onMounted(async () => {
  filterRooms()
})
</script>

<style scoped>
.rooms-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.search-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.search-summary p {
  margin: 0;
  color: #555;
}

.modify-search-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.modify-search-btn:hover {
  background-color: #5a6268;
}

.filters-section {
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: end;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.room-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.room-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.room-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.room-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-image .banner .title {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  font-size: 1.2rem;
}

.room-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: #2c3e50;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.room-details {
  padding: 1.5rem;
}

.room-name {
  color: #2c3e50;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.room-description {
  color: #7f8c8d;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.room-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.feature {
  background-color: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.8rem;
  color: #495057;
}

.room-info {
  margin-bottom: 1.5rem;
}

.room-info > div {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

.room-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  color: #ffc107;
  font-size: 1rem;
}

.rating-text {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.room-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.room-price {
  display: flex;
  flex-direction: column;
}

.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.per-night {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.select-room-btn {
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.select-room-btn:hover:not(:disabled) {
  background-color: #34495e;
}

.select-room-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.no-rooms {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.no-rooms h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .search-summary {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .rooms-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .filters {
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .room-details {
    padding: 1rem;
  }

  .room-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .select-room-btn {
    width: 100%;
  }
}
</style>
