import { BookingStorage } from '~/server/utils/booking-storage'

export default defineEventHandler(async (event) => {
  const bookingId = getRouterParam(event, 'id')

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

  return {
    data: {
      booking,
    },
  }
})
