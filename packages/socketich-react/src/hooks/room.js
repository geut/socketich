import { useClient } from './client.js'

export function useRoom (roomName) {
  const client = useClient()
  const room = client.createRoom(roomName)

  return {
    room,
    deleteRoom () {
      client.deleteRoom(roomName)
    },
    client
  }
}
