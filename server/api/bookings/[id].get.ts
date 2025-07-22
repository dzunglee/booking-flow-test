export default defineEventHandler(async (event) => {
  const bookingId = getRouterParam(event, 'id')

  if (!bookingId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Booking ID is required',
    })
  }

  // Get bookings
  const bookings: any = (await useStorage('data').getItem('bookings')) || []

  const booking = bookings.find((b: any) => b.id === bookingId)

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
