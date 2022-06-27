import assert from 'nanoassert'

import { MESSAGE_EVENTS } from '@geut/socketich-utils/message'

export class Room {
  _roomName
  _userId // For message room
  _onEvent
  _onEmit
  _users = new Set()
  _events = new Map()

  /**
   *
   * @param {String} name name for the room
   * @param {Object} options Room options
   * @param {Function} options.onEvent event handler
   * @param {Function} options.onEmit emit handler
   */
  constructor (roomName, options = {}) {
    const { userId, onEvent = () => null, onEmit = () => null, onConnected = () => false } = options

    this._name = roomName
    this._userId = userId
    this._onEvent = onEvent
    this._onEmit = onEmit
    this._onConnected = onConnected

    this._init()
  }

  get name () {
    return `${this._name}`
  }

  get connected () {
    return this._onConnected()
  }

  get users () {
    return Array.from(this._users.values())
  }

  _init () {
    this.on(MESSAGE_EVENTS.userConnected, this._onUserConnected.bind(this))
    this.on(MESSAGE_EVENTS.userConnectedAck, this._onUserConnectedAck.bind(this))
    this.on(MESSAGE_EVENTS.userDisconnected, this._onUserDisconnected.bind(this))
  }

  _onMessage (eventName, data, from, direct) {
    const handlers = this._events.get(eventName)

    if (!handlers) return

    handlers.forEach(handler => handler(data, from, direct))
  }

  _onUserConnected (_, userId) {
    const userKey = `${userId}`

    this._users.add(userKey)

    this.emit(MESSAGE_EVENTS.userConnectedAck, null, userKey)
  }

  _onUserConnectedAck (_, userId) {
    const userKey = `${userId}`
    this._users.add(userKey)
  }

  _onUserDisconnected (_, userId) {
    const userKey = `${userId}`
    this._users.delete(userKey)
  }

  emit (eventName, data, to) {
    assert(eventName !== undefined && MESSAGE_EVENTS[eventName] === undefined, 'event is required')
    return this._onEmit(eventName, data, to)
  }

  on (eventName, onEvent) {
    let handlers = this._events.get(eventName)
    if (!handlers) {
      handlers = new Set()
      this._events.set(eventName, handlers)
    }

    handlers.add(onEvent)

    return () => handlers.delete(onEvent)
  }

  off (eventName, onEvent) {
    const handlers = this._events.get(eventName)

    if (!handlers) {
      return
    }

    handlers.delete(onEvent)
  }

  once (eventName, onEvent) {
    const dispose = this.on(eventName, (data, from) => {
      try {
        onEvent(data, from)
      } finally {
        dispose()
      }
    })

    return dispose
  }

  onUserConnected (onEvent) {
    const users = new Set()

    const handler = (data, from) => {
      const userKey = `${from}`

      if (users.has(userKey)) return

      users.add(userKey)
      onEvent(from)
    }

    const handlerDisconnected = (data, from) => {
      users.delete(`${from}`)
    }

    const disposers = [
      this.on(MESSAGE_EVENTS.userConnected, handler),
      this.on(MESSAGE_EVENTS.userConnectedAck, handler),
      this.on(MESSAGE_EVENTS.userDisconnected, handlerDisconnected)
    ]

    return () => {
      disposers.forEach(dispose => dispose())
    }
  }

  onUserDisconnected (onEvent) {
    const handler = (data, from) => onEvent(from)
    return this.on(MESSAGE_EVENTS.userDisconnected, handler)
  }
}
