import { v4 as uuid } from 'uuid'
import PersistentWebSocket from 'pws'
import { unpack } from 'msgpackr'
import assert from 'nanoassert'

import { MESSAGE_ACTIONS, MESSAGE_EVENTS, MESSAGE_STATES } from '@geut/socketich-utils/message'
import { packMessage, unpackMessage } from '@geut/socketich-utils/pack'
import { GLOBAL_ROOM, isUserRoom } from '@geut/socketich-utils/room'

import { createSignal } from './utils.js'

import { Room } from './room.js'

export class Client {
  _url
  _userId
  _socket
  _rooms = new Map()
  _ready = createSignal()

  constructor (url, userId) {
    // assert(url !== undefined, 'url is required')
    // assert(userId !== undefined, 'userId is required')

    if (!url) {
      url = new URL(window.location.href)
      url.protocol = url.protocol.replace('http', 'ws')
      url.pathname = '/'
    }

    if (!userId) {
      userId = uuid()
    }

    this._url = new URL(url)
    this._userId = userId
    this._url.searchParams.set('userId', this._userId)
    this._socket = new PersistentWebSocket()
    this._socket.onerror = (err) => console.error(err)
    this._socket.binaryType = 'arraybuffer'

    this._init()

    this._socket.connect(this._url.toString())
  }

  get userId () {
    return this._userId
  }

  get connected () {
    const signal = createSignal()

    if (!this.disconnected) {
      signal.resolve()
    } else {
      this._ready = createSignal(this._ready)
      this._socket.addEventListener('open', signal.resolve, { once: true })
    }

    return signal.then(this._ready)
  }

  get disconnected () {
    try {
      return this._socket.readyState !== this._socket.OPEN
    } catch (err) {
      return false
    }
  }

  get rooms () {
    return this._rooms
  }

  get userRoom () {
    return this.getRoom(this._userId)
  }

  get users () {
    return this.userRoom.users
  }

  get protectedRooms () {
    return [
      `${this.userId}`,
      `${GLOBAL_ROOM}`
    ]
  }

  _init () {
    this._socket.onmessage = this._onMessage.bind(this)

    // Get all rooms and subscribe
    this._socket.addEventListener('open', () => {
      this._rooms.forEach(room => {
        if (this._isProtectedRoom(room.name)) return

        room.emit(MESSAGE_ACTIONS.subscribe)
      })
    })

    this._socket.addEventListener('close', () => {
      this._ready = createSignal(this._ready)
    })

    // Create user room: /userId
    this.createRoom(this._userId)
  }

  _onMessage (message) {
    const { room: roomName, event, data, from, to, state } = this._decode(message.data)

    if (state === MESSAGE_STATES.ping) return
    if (state === MESSAGE_STATES.ready) return this._ready.resolve()

    const room = this.getRoom(roomName) || this.userRoom

    if (!room) {
      console.log('NO ROOM', room)
      return
    }

    return room._onMessage(event, data, from, to !== undefined && isUserRoom(this._userId, to))
  }

  _onEmit (roomName) {
    const socket = this._socket

    return (event, data, to) => {
      if (this.disconnected) return

      socket.send(this._encode({ room: roomName, event, data, from: this._userId, to }))
    }
  }

  _encode (message) {
    return packMessage(message)
  }

  _decode (message) {
    const unpackedMessage = unpackMessage(message)

    return { ...unpackedMessage, data: unpackedMessage.data ? unpack(unpackedMessage.data) : undefined }
  }

  _isProtectedRoom (roomName) {
    return this.protectedRooms.includes(`${roomName}`)
  }

  /**
   *
   * @param {String} roomName room's name
   * @returns Room room
   */
  getRoom (roomName) {
    return this._rooms.get(`${roomName}`)
  }

  /**
   *
   * @param {String} roomName room's name
   * @returns {Room} room
   */
  createRoom (roomName) {
    assert(roomName !== GLOBAL_ROOM, 'Protected room')

    let room = this.getRoom(roomName)
    if (room) return room

    room = new Room(roomName, {
      onEmit: this._onEmit(roomName),
      onConnected: async () => this.connected
    })

    this._rooms.set(room.name, room)

    if (!this._isProtectedRoom(roomName)) {
      room.emit(MESSAGE_ACTIONS.subscribe)
    }

    return room
  }

  deleteRoom (roomName) {
    const roomKey = `${roomName}`
    assert(roomName !== undefined && roomKey.length && !this._isProtectedRoom(roomKey), 'roomName is required')

    const room = this._rooms.get(roomKey)
    if (!room) return

    this._rooms.delete(roomKey)

    room.emit(MESSAGE_ACTIONS.unsubscribe)
  }

  emit (eventName, data, to) {
    assert(eventName !== undefined && (MESSAGE_EVENTS[eventName] === undefined && eventName !== 'broadcast'), `Wrong event "${eventName}.`)
    return this.userRoom.emit(eventName, data, to)
  }

  on (eventName, onEvent) {
    return this.userRoom.on(eventName, onEvent)
  }

  off (eventName, onEvent) {
    return this.userRoom.off(eventName, onEvent)
  }

  onConnected (onEvent) {
    const handler = async (...data) => {
      await this.connected
      onEvent(data)
    }

    this._socket.addEventListener('open', handler)

    return () => {
      this._socket.removeEventListener('open', handler)
    }
  }

  onDisconnected (onEvent) {
    this._socket.addEventListener('close', onEvent)

    return () => {
      this._socket.removeEventListener('close', onEvent)
    }
  }

  onUserConnected (onEvent) {
    return this.userRoom.onUserConnected(onEvent)
  }

  onUserDisconnected (onEvent) {
    return this.userRoom.onUserDisconnected(onEvent)
  }

  close () {
    if ([this._socket.CLOSING, this._socket.CLOSED].includes(this._socket.readyState)) return
    this._socket.onerror = () => null
    this._socket.close()
  }
}
