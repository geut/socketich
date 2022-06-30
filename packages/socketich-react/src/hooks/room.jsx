import { useClient } from './client.jsx'

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
