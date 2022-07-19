import { useContext, createContext, useEffect } from 'react'

import { SocketichContext } from './SocketichProvider'

export const SocketichClientContext = createContext()

export function SocketichClientProvider ({ id, config, children }) {
  const { clients, createClient } = useContext(SocketichContext)

  useEffect(() => {
    if (clients[id]) return
    createClient(id, config)
  }, [id, config])

  if (!clients[id]) return null

  return (
    <SocketichClientContext.Provider value={clients[id]}>
      {children}
    </SocketichClientContext.Provider>
  )
}
