import React from 'react'
import ReactDOM from 'react-dom/client'

import { SocketichProvider } from '@geut/socketich-react'

import App from './App'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SocketichProvider>
      <App />
    </SocketichProvider>
  </React.StrictMode>
)
