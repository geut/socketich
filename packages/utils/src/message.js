export const MESSAGE_ACTIONS = {
  subscribe: 's',
  unsubscribe: 'u'
}

export const MESSAGE_EVENTS = {
  userConnected: 'uc',
  userConnectedAck: 'uca',
  userDisconnected: 'ud'
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
