export const MESSAGE_ACTIONS = {
  subscribe: 0,
  unsubscribe: 1
}

export const MESSAGE_EVENTS = {
  userConnected: 0,
  userConnectedAck: 1,
  userDisconnected: 2
}

export const MESSAGE_KEYS = {
  room: 0,
  event: 1,
  from: 2,
  to: 3,
  data: 4,
  state: 5
}

export const MESSAGE_STATES = {
  ping: 0,
  ready: 1,
  subscribed: 2,
  unsubscribed: 3
}
