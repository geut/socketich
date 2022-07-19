import { useState, useEffect, useCallback } from 'react'

import { useRoom } from '@geut/socketich-react'

export function useChat (roomName) {
  const { room, client } = useRoom(roomName)
  const [messages, setMessages] = useState([])
  const [username, setUsername] = useState()

  useEffect(() => {
    const unsubscribeChat = room.on('chat-message', (data, userId) => {
      setMessages(messages => [...messages, { message: data.message, name: data.name, userId }])
    })

    return () => {
      unsubscribeChat()
    }
  }, [room])

  const sendMessage = useCallback(function sendMessage (message) {
    room.emit('chat-message', { message, name: username })
    setMessages(messages => [...messages, { message, userId: client.userId }])
  }, [room, username])

  return { messages, sendMessage, client, setUsername }
}
