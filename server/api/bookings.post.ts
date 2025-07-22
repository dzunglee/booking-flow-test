import { BookingStorage } from '~/server/utils/booking-storage'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const token = getCookie(event, 'auth-token')
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  const session = await getSessionFromToken(token)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid session',
    })
  }

  const { room, searchParams, contactInfo, pricing } = body

  if (!room || !searchParams || !contactInfo || !pricing) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required booking data',
    })
  }

  const booking = {
    id: BookingStorage.generateId(),
    userId: session.userId,
    roomId: room.id,
    roomName: room.name,
    room: room,
    contactInfo,
    searchParams,
    pricing,
    status: 'confirmed' as const,
    bookingReference: BookingStorage.generateReference(),
    createdAt: new Date().toISOString(),
  }

  // Save booking to Redis
  await BookingStorage.saveBooking(booking)

  return {
    data: {
      success: true,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      booking,
    },
  }
})
