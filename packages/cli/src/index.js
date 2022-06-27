import process from 'node:process'

import meow from 'meow'
import updateNotifier from 'update-notifier'
import boxen from 'boxen'

import { PORT, HOST, createServer } from '@geut/socketich'

const socketichCli = meow(`
  Usage
    $ socketich

  Options
    --port, -p  WebSocket server port  
    --host, -h  WebSocket server host  
  
  Examples
    $ socketich
    $ socketich -p 3001
    $ socketich -h 127.0.0.1
`, {
  importMeta: import.meta,
  flags: {
    port: {
      type: 'number',
      alias: 'p',
      default: PORT
    },
    host: {
      type: 'string',
      alias: 'h',
      default: HOST
    }
  }
})

const { port, host } = socketichCli.flags

let shutdownApp
try {
  shutdownApp = createServer({ port, host })

  const serverURL = `http://${host}:${port}`
  const wsServerURL = `ws://${host}:${port}`
  const serverHealthURL = `${serverURL}/health`

  console.clear()
  console.log(boxen(`
    - Server WebSocket URL: ${wsServerURL}
    - Server Health URL: ${serverHealthURL}
    - Client assets:
      - ${serverURL}/client.js (esm)
      - ${serverURL}/client.min.js (esm, min)
      - ${serverURL}/client.js?format=iife (iife)
      - ${serverURL}/client.min.js?format=iife (iife, min)  
  `, { title: 'Socketich is running! 🚀', titleAlignment: 'center' }))
} catch (error) {
  console.error(error)
  process.exit(1)
}

function handleCloseServer () {
  shutdownApp()
  process.exit(0)
}

process.on('SIGINT', handleCloseServer)
process.on('SIGTERM', handleCloseServer)

updateNotifier({ pkg: socketichCli.pkg }).notify()
