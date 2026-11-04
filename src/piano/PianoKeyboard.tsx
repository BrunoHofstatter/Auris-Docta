import { useEffect, useRef } from 'react'
import { formatPitch } from '../music/pitch'
import { pianoKeys } from './layout'
import './piano.css'

interface Props {
  low: number; high: number; disabled: boolean; showLabels: boolean
  pressed: number[]; sustained: number[]
  onPress: (pitch: number, owner: string) => void
  onRelease: (owner: string) => void
  onTap: (pitch: number) => void
  interaction?: 'play' | 'select'
  selected?: number[]
  onSelect?: (pitch: number) => void
}

/** Shared touch/mouse keyboard. Input ownership preserves independent fingers. */
export function PianoKeyboard({ low, high, disabled, showLabels, pressed, sustained, onPress, onRelease, onTap, interaction = 'play', selected = [], onSelect }: Props) {
  const pointers = useRef(new Map<number, number | null>())
  const taps = useRef(new Map<number, { pitch: number; x: number; y: number; moved: boolean }>())
  const releaseRef = useRef(onRelease)
  useEffect(() => { releaseRef.current = onRelease }, [onRelease])
  useEffect(() => {
    const active = pointers.current
    const activeTaps = taps.current
    return () => { active.forEach((_, id) => releaseRef.current(`pointer-${id}`)); active.clear(); activeTaps.clear() }
  }, [low, high, disabled, interaction])
  const keys = pianoKeys(low, high)
  return <div className="piano-keyboard" role="group" aria-label="Piano keyboard"
    aria-disabled={disabled}
    onContextMenu={event => event.preventDefault()}
    onPointerDown={event => {
      if (disabled || (event.pointerType === 'mouse' && event.button !== 0)) return
      const key = (event.target as HTMLElement).closest<HTMLElement>('[data-piano-pitch]')
      if (!key) return
      event.preventDefault()
      const pitch = Number(key.dataset.pianoPitch)
      if (interaction === 'select') {
        taps.current.set(event.pointerId, { pitch, x: event.clientX, y: event.clientY, moved: false })
        event.currentTarget.setPointerCapture(event.pointerId)
        return
      }
      pointers.current.set(event.pointerId, pitch)
      event.currentTarget.setPointerCapture(event.pointerId)
      onPress(pitch, `pointer-${event.pointerId}`)
    }}
    onPointerMove={event => {
      const tap = taps.current.get(event.pointerId)
      if (tap) { if (Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 10) tap.moved = true; return }
      if (!pointers.current.has(event.pointerId)) return
      const key = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-piano-pitch]')
      const pitch = key && event.currentTarget.contains(key) ? Number(key.dataset.pianoPitch) : null
      if (pointers.current.get(event.pointerId) === pitch) return
      onRelease(`pointer-${event.pointerId}`)
      pointers.current.set(event.pointerId, pitch)
      if (pitch !== null) onPress(pitch, `pointer-${event.pointerId}`)
    }}
    onPointerUp={event => {
      const tap = taps.current.get(event.pointerId)
      if (tap) {
        const key = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-piano-pitch]')
        if (!tap.moved && Number(key?.dataset.pianoPitch) === tap.pitch) onSelect?.(tap.pitch)
        taps.current.delete(event.pointerId)
        return
      }
      pointers.current.delete(event.pointerId)
      onRelease(`pointer-${event.pointerId}`)
    }}
    onPointerCancel={event => {
      taps.current.delete(event.pointerId)
      pointers.current.delete(event.pointerId)
      onRelease(`pointer-${event.pointerId}`)
    }}
    onLostPointerCapture={event => {
      taps.current.delete(event.pointerId)
      pointers.current.delete(event.pointerId)
      onRelease(`pointer-${event.pointerId}`)
    }}>
    {keys.map(key => {
      const name = formatPitch(key.pitch)
      const held = pressed.includes(key.pitch)
      const ringing = !held && sustained.includes(key.pitch)
      const chosen = selected.includes(key.pitch)
      return <button type="button" key={key.pitch} data-piano-pitch={key.pitch}
        className={`piano-key ${key.black ? 'piano-key-black' : 'piano-key-white'}${held ? ' is-held' : ''}${ringing ? ' is-sustained' : ''}${chosen ? ' is-selected' : ''}`}
        style={{ left: `${key.left}%`, width: `${key.width}%` }}
        disabled={disabled} aria-label={name} aria-pressed={interaction === 'select' ? chosen : held}
        onKeyDown={event => {
          if (event.code !== 'Space' && event.code !== 'Enter') return
          event.preventDefault()
          if (!event.repeat) {
            if (interaction === 'select') onSelect?.(key.pitch)
            else onPress(key.pitch, `accessible-${event.code}`)
          }
        }}
        onKeyUp={event => {
          if (event.code === 'Space' || event.code === 'Enter') {
            event.preventDefault()
            onRelease(`accessible-${event.code}`)
          }
        }}
        onBlur={() => { onRelease('accessible-Space'); onRelease('accessible-Enter') }}
        onClick={event => { if (event.detail === 0) { if (interaction === 'select') onSelect?.(key.pitch); else onTap(key.pitch) } }}>
        {(showLabels || key.pitch % 12 === 0) && <span className="piano-note-label">{name}</span>}
      </button>
    })}
  </div>
}
