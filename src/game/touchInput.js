/** Events created by the on-screen controls, so the road engine can tell them from keys and the gamepad. */
const touchEvents = new WeakSet()

export function dispatchTouchKey(type, code) {
  const event = new KeyboardEvent(type, { code, bubbles: true, cancelable: true })
  touchEvents.add(event)
  window.dispatchEvent(event)
}

export function isTouchControlEvent(event) {
  return touchEvents.has(event)
}

const HELD = new Set()

export function releaseTouchKey(code) {
  if (!HELD.has(code)) return
  HELD.delete(code)
  dispatchTouchKey('keyup', code)
}

export function pressTouchKey(code) {
  if (HELD.has(code)) return
  HELD.add(code)
  dispatchTouchKey('keydown', code)
}

export function releaseAllTouchKeys() {
  for (const code of HELD) dispatchTouchKey('keyup', code)
  HELD.clear()
}
