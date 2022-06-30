import { createContext, useMemo } from 'react'

import { Client } from '@geut/socketich-client'

const clients = new Map()

function createClient (url, userId) {
  const clientKey = `${url}_${userId}`

  let client
  if (!clients.has(clientKey)) {
    client = new Client(url, userId)
    clients.set(clientKey, client)
  }

  return clients.get(clientKey)
}

export const SocketichClientContext = createContext()

export function SocketichClientProvider ({ url, userId, children }) {
  const client = useMemo(() => createClient(url, userId), [url, userId])

  if (!client) return null

  return (
    <SocketichClientContext.Provider value={client}>
      {children}
    </SocketichClientContext.Provider>
  )
}
