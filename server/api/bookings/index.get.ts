import { BookingStorage } from '~/server/utils/booking-storage'
import { rooms } from '../../data/rooms'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  const session: any = await getSessionFromToken(token)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired session',
    })
  }

  const deluxeRoom = rooms.find((r) => r.id === '1')
  const executiveRoom = rooms.find((r) => r.id === '2')
  const standardRoom = rooms.find((r) => r.id === '3')

  const mockPastBookings =
    session.userId === '1'
      ? [
          {
            id: 1001,
            confirmationNumber: 'HTL001001',
            checkinDate: '2024-12-20',
            checkoutDate: '2024-12-23',
            guests: 2,
            status: 'Completed',
            totalAmount: 967,
            subtotal: 897,
            taxes: 70,
            room: deluxeRoom,
            guestInfo: {
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              phone: '+1234567890',
            },
            createdAt: '2024-12-15T10:30:00.000Z',
          },
          {
            id: 1002,
            confirmationNumber: 'HTL001002',
            checkinDate: '2024-11-10',
            checkoutDate: '2024-11-13',
            guests: 4,
            status: 'Completed',
            totalAmount: 1487,
            subtotal: 1377,
            taxes: 110,
            room: executiveRoom,
            guestInfo: {
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane@example.com',
              phone: '+1234567891',
            },
            createdAt: '2024-11-05T14:20:00.000Z',
          },
          {
            id: 1003,
            confirmationNumber: 'HTL001003',
            checkinDate: '2024-10-05',
            checkoutDate: '2024-10-07',
            guests: 2,
            status: 'Completed',
            totalAmount: 648,
            subtotal: 567,
            taxes: 81,
            room: standardRoom,
            guestInfo: {
              firstName: 'Alice',
              lastName: 'Wilson',
              email: 'alice@example.com',
              phone: '+1234567892',
            },
            createdAt: '2024-10-01T16:45:00.000Z',
          },
        ]
      : []

  let realBookings: any = []
  try {
    const userBookings = await BookingStorage.getUserBookings(session.userId)

    realBookings = userBookings.map((booking: any) => ({
      id: booking.id,
      confirmationNumber: booking.bookingReference,
      checkinDate: booking.searchParams.checkin,
      checkoutDate: booking.searchParams.checkout,
      guests: booking.searchParams.guests,
      status: booking.status === 'confirmed' ? 'Confirmed' : booking.status === 'cancelled' ? 'Cancelled' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
      totalAmount: booking.pricing.total,
      subtotal: booking.pricing.subtotal,
      taxes: booking.pricing.taxes,
      room: booking.room || {
        ...booking.searchParams.room,
        id: booking.roomId,
        name: booking.roomName,
        image: booking.roomImage,
      },
      guestInfo: {
        firstName: booking.contactInfo.name?.split(' ')[0] || booking.contactInfo.firstName,
        lastName: booking.contactInfo.name?.split(' ').slice(1).join(' ') || booking.contactInfo.lastName,
        email: booking.contactInfo.email,
        phone: booking.contactInfo.phone,
      },
      createdAt: booking.createdAt,
    }))
  } catch (error) {
    realBookings = []
  }

  let allBookings = [...realBookings, ...mockPastBookings]

  return {
    success: true,
    data: {
      bookings: allBookings,
    },
  }
})
