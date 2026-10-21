import { useEffect, useRef } from 'react'
import { formatPitch } from '../music/pitch'
import { pianoKeys } from './layout'

interface Props {
  low: number; high: number; disabled: boolean; showLabels: boolean
  pressed: number[]; sustained: number[]
  onPress: (pitch: number, owner: string) => void
  onRelease: (owner: string) => void
  onTap: (pitch: number) => void
}

/** Shared touch/mouse keyboard. Input ownership preserves independent fingers. */
export function PianoKeyboard({ low, high, disabled, showLabels, pressed, sustained, onPress, onRelease, onTap }: Props) {
  const pointers = useRef(new Map<number, number | null>())
  const releaseRef = useRef(onRelease)
  useEffect(() => { releaseRef.current = onRelease }, [onRelease])
  useEffect(() => {
    const active = pointers.current
    return () => { active.forEach((_, id) => releaseRef.current(`pointer-${id}`)); active.clear() }
  }, [low, high, disabled])
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
      pointers.current.set(event.pointerId, pitch)
      event.currentTarget.setPointerCapture(event.pointerId)
      onPress(pitch, `pointer-${event.pointerId}`)
    }}
    onPointerMove={event => {
      if (!pointers.current.has(event.pointerId)) return
      const key = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-piano-pitch]')
      const pitch = key && event.currentTarget.contains(key) ? Number(key.dataset.pianoPitch) : null
      if (pointers.current.get(event.pointerId) === pitch) return
      onRelease(`pointer-${event.pointerId}`)
      pointers.current.set(event.pointerId, pitch)
      if (pitch !== null) onPress(pitch, `pointer-${event.pointerId}`)
    }}
    onPointerUp={event => {
      pointers.current.delete(event.pointerId)
      onRelease(`pointer-${event.pointerId}`)
    }}
    onPointerCancel={event => {
      pointers.current.delete(event.pointerId)
      onRelease(`pointer-${event.pointerId}`)
    }}
    onLostPointerCapture={event => {
      pointers.current.delete(event.pointerId)
      onRelease(`pointer-${event.pointerId}`)
    }}>
    {keys.map(key => {
      const name = formatPitch(key.pitch)
      const held = pressed.includes(key.pitch)
      const ringing = !held && sustained.includes(key.pitch)
      return <button type="button" key={key.pitch} data-piano-pitch={key.pitch}
        className={`piano-key ${key.black ? 'piano-key-black' : 'piano-key-white'}${held ? ' is-held' : ''}${ringing ? ' is-sustained' : ''}`}
        style={{ left: `${key.left}%`, width: `${key.width}%` }}
        disabled={disabled} aria-label={name} aria-pressed={held}
        onKeyDown={event => {
          if (event.code !== 'Space' && event.code !== 'Enter') return
          event.preventDefault()
          if (!event.repeat) onPress(key.pitch, `accessible-${event.code}`)
        }}
        onKeyUp={event => {
          if (event.code === 'Space' || event.code === 'Enter') {
            event.preventDefault()
            onRelease(`accessible-${event.code}`)
          }
        }}
        onBlur={() => { onRelease('accessible-Space'); onRelease('accessible-Enter') }}
        onClick={event => { if (event.detail === 0) onTap(key.pitch) }}>
        {(showLabels || key.pitch % 12 === 0) && <span className="piano-note-label">{name}</span>}
      </button>
    })}
  </div>
}
