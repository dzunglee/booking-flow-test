import { BookingStorage } from '~/server/utils/booking-storage'
import { SessionKV } from '~/server/utils/kv'

export default defineEventHandler(async (event) => {
  const bookingId = getRouterParam(event, 'id')
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  const session = await SessionKV.get(token)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired session',
    })
  }

  if (!bookingId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Booking ID is required',
    })
  }

  const booking = await BookingStorage.getBooking(bookingId)

  if (!booking) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Booking not found',
    })
  }

  if (booking.userId !== session.userId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You can only cancel your own bookings',
    })
  }

  if (booking.status === 'cancelled') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Booking is already cancelled',
    })
  }

  if (booking.status !== 'confirmed') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only confirmed bookings can be cancelled',
    })
  }

  const checkinDate = new Date(booking.searchParams.checkin)
  const today = new Date()
  const daysDiff = (checkinDate.getTime() - today.getTime()) / (1000 * 3600 * 24)

  if (daysDiff <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot cancel booking',
    })
  }

  const cancelledBooking = await BookingStorage.cancelBooking(bookingId)

  return {
    success: true,
    message: 'Booking cancelled successfully',
    booking: cancelledBooking,
  }
})
