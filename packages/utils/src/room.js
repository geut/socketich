export const GLOBAL_ROOM = '__global'

export function buildRoomName (...paths) {
  return `/${paths.join('/')}`
}

export function isUserRoom (userId, roomName) {
  return `${userId}` === `${roomName}`
}
