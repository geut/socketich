import { App, us_listen_socket_close as usListenSocketClose } from 'uWebSockets.js'

import { webSocket } from './routes/websocket.js'
import { client } from './routes/client.js'

export const PORT = process.env.PORT || 3000
export const HOST = process.env.HOST || '0.0.0.0'

export function createServer (opts = {}) {
  const {
    port = PORT,
    host = HOST
  } = opts

  const app = App()

  webSocket(app)
  client(app)

  app.get('/health', (response) => response.writeStatus('200 OK').end('OK'))

  let destroyFn
  app.listen(host, port, socket => {
    if (!socket) {
      throw new Error(`Can't listen on ${host}:${port}.`)
    }

    destroyFn = () => {
      usListenSocketClose(socket)
      socket = null
    }
  })

  return destroyFn
}
