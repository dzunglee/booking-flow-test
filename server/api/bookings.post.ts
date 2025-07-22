export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const token = getCookie(event, 'auth-token')
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  const session = await useStorage('sessions').getItem(token)
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
    id: crypto.randomUUID(),
    userId: session.userId,
    roomId: room.id,
    roomName: room.name,
    room: room,
    contactInfo,
    searchParams,
    pricing,
    status: 'confirmed',
    bookingReference: generateBookingReference(),
    createdAt: new Date().toISOString(),
  }

  const bookings: any = (await useStorage('data').getItem('bookings')) || []
  bookings.push(booking)

  await useStorage('data').setItem('bookings', bookings)

  return {
    data: {
      success: true,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      booking,
    },
  }
})

function generateBookingReference() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return 'BKG' + result
}
