import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { PianoEngine, PlaybackHandle } from '../audio/PianoEngine'
import type { MusicDocument } from '../music/model'

/** UI progress follows the audio clock; note attacks are scheduled by PianoEngine. */
export function usePlayback(engine: RefObject<PianoEngine | null>, document: MusicDocument | null,
  start: number, end: number, rate: number, loop: boolean, enabled: boolean) {
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(start)
  const [error, setError] = useState('')
  const handle = useRef<PlaybackHandle | null>(null)
  const frame = useRef(0)
  const cursor = useRef(start)
  const repeat = useRef(loop)
  repeat.current = loop
  const cancel = useCallback(() => {
    cancelAnimationFrame(frame.current)
    handle.current?.cancel(); handle.current = null
  }, [])
  const pause = useCallback(() => {
    const at = handle.current?.position() ?? cursor.current
    cancel(); cursor.current = at; setPosition(at); setPlaying(false)
  }, [cancel])
  const stop = useCallback(() => { cancel(); cursor.current = start; setPosition(start); setPlaying(false) }, [cancel, start])
  const play = useCallback((from?: number) => {
    cancel()
    if (!document || !engine.current || !enabled) return
    const at = from ?? cursor.current
    cursor.current = at >= end - 0.001 || at < start ? start : at
    const schedule = () => {
      handle.current = engine.current!.playRange(document, { from: cursor.current, to: end, rate })
    }
    try {
      schedule(); setError(''); setPlaying(true)
      const tick = () => {
        if (!handle.current) return
        const at = handle.current.position()
        cursor.current = at; setPosition(at)
        if (at >= end - 0.0001) {
          if (repeat.current) {
            cancel(); cursor.current = start
            try { schedule() } catch { setPlaying(false); return }
          } else { handle.current = null; setPlaying(false); return }
        }
        frame.current = requestAnimationFrame(tick)
      }
      frame.current = requestAnimationFrame(tick)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Playback could not start.'); setPlaying(false) }
  }, [cancel, document, enabled, end, engine, rate, start])
  const seek = useCallback((at: number) => {
    const next = Math.max(start, Math.min(end, at))
    if (next >= end) { cancel(); cursor.current = end; setPosition(end); setPlaying(false) }
    else if (handle.current) play(next)
    else { cursor.current = next; setPosition(next) }
  }, [start, end, play, cancel])
  useEffect(() => { stop(); return cancel }, [document, start, end, rate, stop, cancel])
  useEffect(() => { if (!enabled) pause() }, [enabled, pause])
  useEffect(() => {
    const hidden = () => { if (window.document.hidden) pause() }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') pause() }
    window.addEventListener('blur', pause)
    window.addEventListener('pagehide', pause)
    window.document.addEventListener('visibilitychange', hidden)
    window.addEventListener('keydown', escape)
    return () => {
      window.removeEventListener('blur', pause); window.removeEventListener('pagehide', pause)
      window.document.removeEventListener('visibilitychange', hidden); cancel()
      window.removeEventListener('keydown', escape)
    }
  }, [cancel, pause])
  return { playing, position, error, play, pause, stop, seek }
}
