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

    <div class="loading-spinner" v-if="loading">
      <DotLoader />
    </div>

    <div class="rooms-grid" v-if="!loading">
      <div v-for="room in filteredRooms" :key="room.id" class="room-card">
        <div class="room-image">
          <img :src="room.image" :alt="room.name" />
          <div class="room-badge">{{ room.type }}</div>
        </div>

        <div class="room-content">
          <h3 class="room-name">{{ room.name }}</h3>
          <p class="room-description">{{ room.description }}</p>

          <div class="room-features">
            <span v-for="feature in room.features" :key="feature" class="feature-tag">
              {{ feature }}
            </span>
          </div>

          <div class="room-info">
            <div class="room-size">{{ room.size }} m²</div>
            <div class="room-capacity">Up to {{ room.maxGuests }} guests</div>
            <div class="room-rating">
              <span class="stars">{{ '★'.repeat(Math.floor(room.rating)) }}{{ '☆'.repeat(5 - Math.floor(room.rating)) }}</span>
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

    <div v-if="filteredRooms.length === 0 && !loading" class="no-results">
      <h3>No rooms found</h3>
      <p>Try adjusting your search criteria or dates.</p>
      <button @click="modifySearch" class="modify-search-btn">Modify Search</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const DotLoader = defineAsyncComponent(() => import('~/components/DotLoader.vue'))

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()

const searchParams = computed(() => ({
  checkin: (route.query.checkin as string) || '',
  checkout: (route.query.checkout as string) || '',
  guests: (route.query.guests as string) || '2',
  type: (route.query.type as string) || '',
}))

const hasSearchParams = computed(() => searchParams.value.checkin && searchParams.value.checkout && searchParams.value.guests)

const loading = ref(true)
const filters = reactive({
  sortBy: 'price-low',
})

const rooms = ref([])
const filteredRooms = ref([])

const filterRooms = async () => {
  loading.value = true

  try {
    const response: any = await $fetch('/api/rooms/search', {
      method: 'POST',
      body: {
        ...searchParams.value,
        sortBy: filters.sortBy,
      },
    })

    filteredRooms.value = response.data.rooms || []
  } catch (error) {
    console.error('Error fetching rooms:', error)
  } finally {
    loading.value = false
  }
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
    standard: 'Standard Room',
    deluxe: 'Deluxe Room',
    suite: 'Suite',
    premium: 'Premium Room',
  }
  return labels[type] || type
}

const modifySearch = () => {
  router.push({
    path: '/booking',
    query: {
      checkin: searchParams.value.checkin,
      checkout: searchParams.value.checkout,
      guests: searchParams.value.guests,
      type: searchParams.value.type,
    },
  })
}

const isRoomAvailable = (room: any) => {
  return room.available !== false
}

const selectRoom = (room: any) => {
  if (!isRoomAvailable(room)) return

  navigateTo({
    path: '/booking/contact',
    query: {
      roomId: room.id,
      ...searchParams.value,
    },
  })
}

onMounted(() => {
  filterRooms()
})
</script>

<style scoped>
.page-header,
.filters-section,
.rooms-grid,
.no-results {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  padding-top: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin-bottom: 1rem;
}

.search-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.modify-search-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
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

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
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
  height: 250px;
}

.room-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.room-content {
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

.feature-tag {
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

.no-results {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

@media (max-width: 768px) {
  .search-summary {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .room-footer {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
