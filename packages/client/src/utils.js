export function createSignal (prevSignal) {
  if (prevSignal && !prevSignal.done) return prevSignal

  let resolve = null

  const promise = new Promise(_resolve => {
    resolve = (val) => {
      promise.done = true
      _resolve(val)
    }
  })

  promise.resolve = resolve
  promise.done = false

  return promise
}
