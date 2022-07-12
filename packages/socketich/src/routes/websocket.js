/** @typedef {import('uWebSockets.js').TemplatedApp} TemplatedApp */
/** @typedef {import('uWebSockets.js').WebSocketBehavior} WebSocketBehavior */

import { MESSAGE_ACTIONS, MESSAGE_EVENTS, MESSAGE_STATES } from '@geut/socketich-utils/message'
import { packMessage, unpackMessage } from '@geut/socketich-utils/pack'
import { GLOBAL_ROOM, buildRoomName } from '@geut/socketich-utils/room'

// const PING = pack({ [MESSAGE_KEYS.state]: MESSAGE_STATE.ping })
const READY = packMessage({ state: MESSAGE_STATES.ready })

export const defaultWebSocketOptions = {
  idleTimeout: 16,
  maxPayloadLength: 32 * 1024 * 1024
}

/**
 *
 * Creates a WebSocket handler for '/' in @param {app}
 * 
 * @param {TemplatedApp} app
 * @param {Object} opts
 * @param {WebSocketBehavior} opts.webSocketOptions
 */
export function webSocket (app, opts = {}) {
  const {
    webSocketOptions = {}
  } = opts

  const wsOptions = {
    ...defaultWebSocketOptions,
    ...webSocketOptions
  }

  app.ws('/', {
    ...wsOptions,
    open (ws) {
      // const userId = ws.userId.toString()

      ws.state = {
        topics: new Set()
      }

      // Subscribe to bradcast messages
      ws.subscribe(buildRoomName(GLOBAL_ROOM))

      ws.send(READY, true)
    },

    close (ws) {
      // Use app here. WS is closed!

      // Notify all of my rooms I'm disconnected
      ws.state.topics.forEach(topic => {
        app.publish(buildRoomName(topic), packMessage({
          event: MESSAGE_EVENTS.userDisconnected,
          from: ws.userId,
          room: topic
        }), true)
      })

      // Notify to my personal room
      app.publish(buildRoomName(ws.userId), packMessage({
        event: MESSAGE_EVENTS.userDisconnected,
        from: ws.userId,
        room: ws.userId
      }), true)
    },

    message (ws, message, isBinary) {
      const unpackedMessage = unpackMessage(message)
      const { event, room, to } = unpackedMessage

      switch (event) {
        case MESSAGE_ACTIONS.subscribe:
          ws.subscribe(buildRoomName(room))
          ws.subscribe(buildRoomName(room, ws.userId))

          ws.state.topics.add(room)

          // Notify other users I'm connected this room
          ws.publish(buildRoomName(room), packMessage({ event: MESSAGE_EVENTS.userConnected, room, from: ws.userId }), true)
          break

        case MESSAGE_ACTIONS.unsubscribe:
          ws.unsubscribe(buildRoomName(room))
          ws.unsubscribe(buildRoomName(room, ws.userId))

          ws.state.topics.delete(room)

          // Notify other users I left this room
          ws.publish(buildRoomName(room), packMessage({ event: MESSAGE_EVENTS.userDisconnected, room, from: ws.userId }), true)
          break

        default: {
          // Broadcast some event to room or room/user
          let roomToPublish
          if (to === undefined || to === null) {
            roomToPublish = buildRoomName(room)
          } else {
            roomToPublish = buildRoomName(room, to)
          }

          ws.publish(roomToPublish, message, true)
        }
      }
    },

    upgrade: (res, req, context) => {
      /* This immediately calls open handler, you must not use res after this call */
      res.upgrade(
        { url: req.getUrl(), userId: req.getQuery('userId') },
        req.getHeader('sec-websocket-key'),
        req.getHeader('sec-websocket-protocol'),
        req.getHeader('sec-websocket-extensions'),
        context
      )
    }
  })
}
