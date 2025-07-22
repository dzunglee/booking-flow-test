import { rooms } from '../../data/rooms'

export default defineEventHandler(async (event) => {
  const roomId = getRouterParam(event, 'id')

  if (!roomId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Room ID is required',
    })
  }

  const room = rooms.find((r) => r.id === roomId)

  if (!room) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Room not found',
    })
  }

  return {
    success: true,
    data: {
      room,
    },
  }
})
