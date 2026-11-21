// TouchControls.jsx — On-screen stick and buttons. They dispatch the same
// synthetic key events the gamepad uses; level sessions are not touched.

import { useEffect, useRef, useState } from 'react'
import { isCoarsePointer } from '../game/deviceProfile.js'
import { pressTouchKey, releaseAllTouchKeys, releaseTouchKey } from '../game/touchInput.js'

const TOUCH_LEVELS = new Set([1, 2, 6, 8])
const STICK_RADIUS = 46
const DEADZONE = 0.25

/**
 * Level 1 roll has no keyboard code. A downward swipe starts it, and the
 * gamepad's roll button already emits KeyC (which the road engine ignores).
 * The Roll button sends that KeyC so a real C key still does nothing.
 */
const LEVEL_ACTIONS = {
  1: [
    { code: 'Space', label: 'Jump' },
    { code: 'KeyC', label: 'Roll' },
  ],
  2: [],
  6: [
    { code: 'KeyE', label: 'Interact' },
    { code: 'ShiftLeft', label: 'Sprint' },
    { code: 'KeyC', label: 'Crouch' },
    { code: 'Space', label: 'Refuse' },
  ],
  8: [
    { code: 'KeyE', label: 'Interact' },
    { code: 'ShiftLeft', label: 'Sprint' },
    { code: 'Space', label: 'Refuse' },
  ],
}

function useCoarsePointer() {
  const [coarse, setCoarse] = useState(isCoarsePointer)

  useEffect(() => {
    const media = window.matchMedia('(pointer: coarse)')
    const sync = () => setCoarse(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return coarse
}

function VirtualStick() {
  const knobRef = useRef(null)
  const originRef = useRef({ x: 0, y: 0 })
  const activeRef = useRef(false)
  const codesRef = useRef(new Set())

  const pointerIdRef = useRef(null)

  const placeKnob = (x, y) => {
    const knob = knobRef.current
    if (knob) knob.style.transform = `translate(${x}px, ${y}px)`
  }

  const syncCodes = (next) => {
    const prev = codesRef.current
    for (const code of prev) {
      if (!next.has(code)) releaseTouchKey(code)
    }
    for (const code of next) {
      if (!prev.has(code)) pressTouchKey(code)
    }
    codesRef.current = next
  }

  const applyPoint = (clientX, clientY) => {
    let dx = clientX - originRef.current.x
    let dy = clientY - originRef.current.y
    const distance = Math.hypot(dx, dy)
    if (distance > STICK_RADIUS) {
      dx = (dx / distance) * STICK_RADIUS
      dy = (dy / distance) * STICK_RADIUS
    }
    placeKnob(dx, dy)
    const nx = dx / STICK_RADIUS
    const ny = dy / STICK_RADIUS
    const next = new Set()
    if (ny < -DEADZONE) next.add('KeyW')
    if (ny > DEADZONE) next.add('KeyS')
    if (nx < -DEADZONE) next.add('KeyA')
    if (nx > DEADZONE) next.add('KeyD')
    syncCodes(next)
  }

  const endStick = () => {
    activeRef.current = false
    pointerIdRef.current = null
    placeKnob(0, 0)
    syncCodes(new Set())
  }

  useEffect(() => () => endStick(), [])

  return (
    <div
      className="touch-controls__stick"
      aria-label="Move"
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.preventDefault()
        const rect = event.currentTarget.getBoundingClientRect()
        originRef.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        }
        activeRef.current = true
        pointerIdRef.current = event.pointerId
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch {
          // Pointer capture needs an active pointer. The stick still tracks moves on this element.
        }
        applyPoint(event.clientX, event.clientY)
      }}
      onPointerMove={(event) => {
        if (!activeRef.current || event.pointerId !== pointerIdRef.current) return
        applyPoint(event.clientX, event.clientY)
      }}
      onPointerUp={endStick}
      onPointerCancel={endStick}
      onContextMenu={(event) => event.preventDefault()}
    >
      <span ref={knobRef} className="touch-controls__knob" />
    </div>
  )
}

function TouchKeyButton({ code, label }) {
  const heldRef = useRef(false)

  const release = () => {
    if (!heldRef.current) return
    heldRef.current = false
    releaseTouchKey(code)
  }

  useEffect(() => () => release(), [code])

  return (
    <button
      type="button"
      className="touch-controls__btn"
      aria-label={label}
      tabIndex={-1}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.preventDefault()
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch {
          // Same as the stick: capture is best-effort.
        }
        if (heldRef.current) return
        heldRef.current = true
        pressTouchKey(code)
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={(event) => event.preventDefault()}
    >
      {label}
    </button>
  )
}

function TouchControlsLayout({ level }) {
  const actions = LEVEL_ACTIONS[level] ?? []

  useEffect(() => () => releaseAllTouchKeys(), [level])

  return (
    <div className="touch-controls" data-touch-controls>
      <VirtualStick />
      {actions.length > 0 && (
        <div className="touch-controls__actions">
          {actions.map((action) => (
            <TouchKeyButton key={action.code} code={action.code} label={action.label} />
          ))}
        </div>
      )}
    </div>
  )
}

export function TouchControls({ level }) {
  const coarse = useCoarsePointer()
  if (!coarse || !TOUCH_LEVELS.has(level)) return null
  return <TouchControlsLayout level={level} />
}
