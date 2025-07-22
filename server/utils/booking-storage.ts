import { getKV } from './kv'

export interface Booking {
  id: string
  userId: string
  roomId: string
  roomName: string
  room: any
  contactInfo: any
  searchParams: any
  pricing: any
  status: 'confirmed' | 'cancelled'
  bookingReference: string
  createdAt: string
  cancelledAt?: string
}

const BookingKV = getKV()

export const BookingStorage = {
  async saveBooking(booking: Booking): Promise<void> {
    const key = `booking:${booking.id}`
    await BookingKV.set(key, booking, { ex: 86400 * 365 }) // 1 year TTL

    await this.addBookingToUserList(booking.userId, booking.id)
  },

  async getBooking(id: string): Promise<any | null> {
    const key = `booking:${id}`
    return await BookingKV.get(key)
  },

  async getUserBookings(userId: string): Promise<Booking[]> {
    const listKey = `user_bookings:${userId}`
    const bookingIds: any = (await BookingKV.get(listKey)) || []

    const bookings: Booking[] = []
    for (const bookingId of bookingIds) {
      const booking = await this.getBooking(bookingId)
      if (booking) {
        bookings.push(booking)
      }
    }

    return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async addBookingToUserList(userId: string, bookingId: string): Promise<void> {
    const listKey = `user_bookings:${userId}`
    const currentList: any = (await BookingKV.get(listKey)) || []

    if (!currentList.includes(bookingId)) {
      currentList.push(bookingId)
      await BookingKV.set(listKey, currentList, { ex: 86400 * 365 }) // 1 year TTL
    }
  },

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    const booking = await this.getBooking(id)
    if (!booking) {
      return null
    }

    const updatedBooking = { ...booking, ...updates }
    await this.saveBooking(updatedBooking)
    return updatedBooking
  },

  async cancelBooking(id: string): Promise<Booking | null> {
    return await this.updateBooking(id, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    })
  },

  generateId(): string {
    return `booking_${Date.now()}_${Math.random().toString(36).slice(2)}`
  },

  generateReference(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return 'BKG' + result
  },
}
