import { rooms } from '@/data/mocks'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface Room {
  id: number
  name: string
  type: string
  description: string
  price: number
  size: number
  maxGuests: number
  rating: number
  reviews: number
  image: string
  features: string[]
  available: boolean
}

export interface BookingDates {
  checkin: string
  checkout: string
  guests: number
}

export interface ContactInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  specialRequests?: string
  newsletter: boolean
  paymentMethod: string
  agreeTerms: boolean
}

export interface Booking {
  id?: number
  confirmationNumber: string
  room: Room
  dates: BookingDates
  contact: ContactInfo
  pricing: {
    subtotal: number
    taxes: number
    total: number
  }
  status: 'Confirmed' | 'Cancelled' | 'Completed'
  createdAt: string
}

export const useBookingStore = defineStore('booking', () => {
  const currentBooking = ref<Partial<Booking>>({})
  const userBookings = ref<Booking[]>([])
  const searchParams = ref<BookingDates>({
    checkin: '',
    checkout: '',
    guests: 1,
  })

  const availableRooms = ref<Room[]>(rooms)

  const filteredRooms = computed(() => {
    return availableRooms.value.filter((room) => {
      if (searchParams.value.guests && room.maxGuests < searchParams.value.guests) {
        return false
      }
      return true
    })
  })

  const upcomingBookings = computed(() => {
    const today = new Date()
    return userBookings.value.filter((booking) => new Date(booking.dates.checkin) >= today && booking.status !== 'Cancelled')
  })

  const pastBookings = computed(() => {
    const today = new Date()
    return userBookings.value.filter((booking) => new Date(booking.dates.checkout) < today || booking.status === 'Completed')
  })

  const setSearchParams = (params: Partial<BookingDates>) => {
    searchParams.value = { ...searchParams.value, ...params }
  }

  const selectRoom = (room: Room) => {
    currentBooking.value.room = room
  }

  const setBookingDates = (dates: BookingDates) => {
    currentBooking.value.dates = dates
    searchParams.value = dates
  }

  const setContactInfo = (contact: ContactInfo) => {
    currentBooking.value.contact = contact
  }

  const calculatePricing = (room: Room, checkin: string, checkout: string) => {
    const nights = Math.ceil((new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 3600 * 24))
    const subtotal = room.price * nights
    const taxes = Math.round(subtotal * 0.12)
    const total = subtotal + taxes

    return { subtotal, taxes, total }
  }

  const createBooking = async (bookingData: Partial<Booking>): Promise<string> => {
    try {
      const confirmationNumber = 'HTL' + Date.now().toString().slice(-6)

      const pricing = calculatePricing(bookingData.room!, bookingData.dates!.checkin, bookingData.dates!.checkout)

      const newBooking: Booking = {
        id: Date.now(),
        confirmationNumber,
        room: bookingData.room!,
        dates: bookingData.dates!,
        contact: bookingData.contact!,
        pricing,
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
      }

      userBookings.value.push(newBooking)

      saveBookingsToStorage()

      currentBooking.value = {}

      return confirmationNumber
    } catch (error) {
      throw new Error('Failed to create booking')
    }
  }

  const cancelBooking = (confirmationNumber: string) => {
    const booking = userBookings.value.find((b) => b.confirmationNumber === confirmationNumber)
    if (booking) {
      booking.status = 'Cancelled'
      saveBookingsToStorage()
    }
  }

  const getRoomById = (id: number): Room | undefined => {
    return availableRooms.value.find((room) => room.id === id)
  }

  const saveBookingsToStorage = () => {
    localStorage.setItem('userBookings', JSON.stringify(userBookings.value))
  }

  const loadBookingsFromStorage = () => {
    const saved = localStorage.getItem('userBookings')
    if (saved) {
      try {
        userBookings.value = JSON.parse(saved)
      } catch (error) {
        console.error('Error loading bookings from storage:', error)
      }
    }
  }

  loadBookingsFromStorage()

  return {
    currentBooking,
    userBookings,
    searchParams,
    availableRooms,

    filteredRooms,
    upcomingBookings,
    pastBookings,

    setSearchParams,
    selectRoom,
    setBookingDates,
    setContactInfo,
    calculatePricing,
    createBooking,
    cancelBooking,
    getRoomById,
    saveBookingsToStorage,
    loadBookingsFromStorage,
  }
})
