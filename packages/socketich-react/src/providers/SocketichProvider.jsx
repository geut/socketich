import { createContext, useState } from 'react'

export const SocketichContext = createContext({})

export function SocketichProvider ({ children }) {
  const [clients, setClients] = useState({})

  async function createClient (id, config) {
    if (!clients[id]) {
      const clientUrl = `${config.url.replace('ws', 'http')}/client.min.js`
      const { SocketichClient } = await import(/* @vite-ignore */ clientUrl)

      const client = new SocketichClient(config.url, config.userId)

      setClients(clients => ({
        ...clients,
        [id]: client
      }))
    }
  }

  return (
    <SocketichContext.Provider
      value={{
        clients,
        createClient
      }}
    >
      {children}
    </SocketichContext.Provider>
  )
}
