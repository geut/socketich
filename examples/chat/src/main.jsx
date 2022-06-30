import React from 'react'
import ReactDOM from 'react-dom/client'

import { SocketichClientProvider } from '@geut/socketich-react'

import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SocketichClientProvider url='ws://0.0.0.0:3001'>
      <App />
    </SocketichClientProvider>
  </React.StrictMode>
)
