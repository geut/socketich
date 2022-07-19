import { SocketichClientProvider } from '@geut/socketich-react'

import { Chat } from './Chat'

function App () {
  return (
    <SocketichClientProvider
      id='chat-client'
      config={{
        url: 'ws://localhost:3001'
      }}
    >
      <Chat />
    </SocketichClientProvider>
  )
}

export default App
