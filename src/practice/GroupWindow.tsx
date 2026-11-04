import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'

export default function GroupWindow({ groups, current, onSelect, onInsert, onDelete }: {
  groups: number[][]; current: number; onSelect: (index: number) => void; onInsert: (index: number) => void; onDelete: (index: number) => void
}) {
  const [menu, setMenu] = useState<{ index: number; x: number; y: number } | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const held = useRef(false)
  const origin = useRef({ x: 0, y: 0 })
  const cancel = () => { clearTimeout(timer.current) }
  useEffect(() => {
    root.current?.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [current, groups.length])
  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    if (!menu) return
    const dismiss = (event: globalThis.PointerEvent) => { if (!(event.target as HTMLElement).closest('.practice-group-menu')) setMenu(null) }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenu(null) }
    window.addEventListener('pointerdown', dismiss); window.addEventListener('keydown', escape)
    return () => { window.removeEventListener('pointerdown', dismiss); window.removeEventListener('keydown', escape) }
  }, [menu])
  const open = (index: number, x: number, y: number) => { cancel(); setMenu({ index, x: Math.max(8, Math.min(x, window.innerWidth - 180)), y: Math.max(8, Math.min(y, window.innerHeight - 108)) }) }
  const down = (event: PointerEvent, index: number) => {
    held.current = false; cancel(); origin.current = { x: event.clientX, y: event.clientY }
    if (event.pointerType === 'touch' || event.pointerType === 'pen') timer.current = setTimeout(() => { held.current = true; open(index, event.clientX, event.clientY) }, 550)
  }
  return <div className="practice-group-window" ref={root} role="group" aria-label="Answer groups">
    {groups.map((group, index) => <button type="button" key={index} aria-label={`Group ${index + 1}${group.length ? '' : ', empty'}`} aria-current={index === current ? 'true' : undefined}
      className={`practice-group${group.length ? ' is-filled' : ''}`} onPointerDown={event => down(event, index)}
      onPointerMove={event => { if (Math.hypot(event.clientX - origin.current.x, event.clientY - origin.current.y) > 10) cancel() }}
      onPointerUp={cancel} onPointerCancel={cancel}
      onContextMenu={event => { event.preventDefault(); open(index, event.clientX, event.clientY) }}
      onKeyDown={event => { if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) { event.preventDefault(); const box = event.currentTarget.getBoundingClientRect(); open(index, box.left, box.bottom) } }}
      onClick={() => { if (!held.current) onSelect(index) }}>{index + 1}<i aria-hidden="true" /></button>)}
    {menu && <div className="practice-group-menu" role="group" aria-label={`Actions for group ${menu.index + 1}`} style={{ left: menu.x, top: menu.y }}>
      <button onClick={() => { onInsert(menu.index); setMenu(null) }}>Insert before</button>
      <button onClick={() => { onDelete(menu.index); setMenu(null) }}>Delete group</button>
    </div>}
  </div>
}
