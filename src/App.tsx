import { useEffect, useRef, useState } from 'react'
import FreePlay from './piano/FreePlay'
import Home from './Home'
import Practice from './practice/Practice'

const pages = {
  home: 'Home',
  'free-play': 'Free play',
  practice: 'Practice',
} as const
type Page = keyof typeof pages

function currentPage(): Page | 'not-found' {
  const path = window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '')
  if (!path) return 'home'
  if (Object.hasOwn(pages, path)) return path as Page
  return 'not-found'
}

export default function App() {
  const [page, setPage] = useState(currentPage)
  const main = useRef<HTMLElement>(null)
  const initial = useRef(true)
  useEffect(() => {
    const onHashChange = () => setPage(currentPage())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  useEffect(() => {
    const title = page === 'not-found' ? 'Page not found' : pages[page]
    document.title = `${title} · Auris Docta`
    if (initial.current) { initial.current = false; return }
    main.current?.focus()
    window.scrollTo(0, 0)
  }, [page])
  if (page === 'free-play' || page === 'home' || page === 'practice') {
    return <>
      <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); main.current?.focus() }}>Skip to content</a>
      <main id="main-content" ref={main} tabIndex={-1}>
        {page === 'home' ? <Home /> : page === 'practice' ? <Practice /> : <FreePlay />}
      </main>
    </>
  }
  return <div className="app-shell">
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); main.current?.focus() }}>Skip to content</a>
    <header className="site-header">
      <a className="brand" href="#/home" aria-label="Auris Docta home"><span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span><span>Auris Docta<span className="brand-subtitle">PIANO & EAR TRAINING</span></span></a>
      <nav aria-label="Main navigation">{(Object.keys(pages) as Page[]).map(key => <a href={`#/${key}`} key={key}>{pages[key]}</a>)}</nav>
      <span className="preview-label">EARLY PREVIEW</span>
    </header>
    <main id="main-content" ref={main} tabIndex={-1}>
      <section className="not-found"><p className="eyebrow">PAGE NOT FOUND</p><h1>Let’s find our way back.</h1><a className="button primary" href="#/home">Back home →</a></section>
    </main>
    <footer className="site-footer"><span>Auris Docta</span><span>A little listening, every day.</span></footer>
  </div>
}
