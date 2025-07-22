import { rooms } from '../../data/rooms'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const allRooms = rooms

  let filteredRooms = [...allRooms]

  if (body.guests) {
    const guestCount = parseInt(body.guests)
    filteredRooms = filteredRooms.filter((room) => room.maxGuests >= guestCount)
  }

  if (body.type && body.type !== '') {
    filteredRooms = filteredRooms.filter((room) => room.type.toLowerCase() === body.type.toLowerCase())
  }

  switch (body.sortBy) {
    case 'price-low':
      filteredRooms.sort((a, b) => a.price - b.price)
      break
    case 'price-high':
      filteredRooms.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      filteredRooms.sort((a, b) => b.rating - a.rating)
      break
    case 'size':
      filteredRooms.sort((a, b) => b.size - a.size)
      break
    default:
      filteredRooms.sort((a, b) => a.price - b.price)
  }

  return {
    success: true,
    data: {
      rooms: filteredRooms,
      total: filteredRooms.length,
      filters: {
        checkin: body.checkin,
        checkout: body.checkout,
        guests: body.guests,
        type: body.type,
        sortBy: body.sortBy,
      },
    },
  }
})
