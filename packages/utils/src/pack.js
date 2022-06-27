import { pack, unpack } from 'msgpackr'

import { MESSAGE_KEYS } from './message.js'

export function packMessage (message) {
  const packet = []

  for (const key in message) {
    if (message[key] !== undefined) {
      packet[MESSAGE_KEYS[key]] = key === 'data' ? pack(message[key]) : message[key]
    }
  }

  return pack(packet)
}

export function unpackMessage (message) {
  let {
    [MESSAGE_KEYS.room]: room,
    [MESSAGE_KEYS.event]: event,
    [MESSAGE_KEYS.from]: from,
    [MESSAGE_KEYS.to]: to,
    [MESSAGE_KEYS.data]: data,
    [MESSAGE_KEYS.state]: state
  } = unpack(new Uint8Array(message))

  room = room !== undefined ? room.toString() : undefined
  to = to !== undefined ? to.toString() : undefined

  return { room, event, data, state, from, to }
}
