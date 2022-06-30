import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react'
import { useRoom } from '@geut/socketich-react'

// const clients = new Map()

// function createClient (url, userId) {
//   const clientKey = `${url}_${userId}`

//   let client
//   if (!clients.has(clientKey)) {
//     client = new Client(url, userId)
//     clients.set(clientKey, client)
//   }

//   return clients.get(clientKey)
// }

// const SocketichClientContext = createContext()

// export function SocketichClientProvider ({ url, userId, children }) {
//   const client = useMemo(() => createClient(url, userId), [url, userId])

//   console.log(client)

//   if (!client) return null

//   return (
//     <SocketichClientContext.Provider value={client}>
//       {children}
//     </SocketichClientContext.Provider>
//   )
// }

// export function useClient () {
//   return useContext(SocketichClientContext)
// }

export function useChat (roomName) {
  // const client = useClient()
  const { room, client } = useRoom()
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const unsubscribe = room.on('chat-message', (data, userId) => {
      setMessages(messages => [...messages, { message: data.message, name: data.name, userId }])
    })

    return () => {
      unsubscribe()
    }
  }, [room])

  const sendMessage = useCallback(function sendMessage (message) {
    room.emit('chat-message', { message })
    setMessages(messages => [...messages, { message, userId: client.userId }])
  }, [room])

  return { messages, sendMessage, client }
}
