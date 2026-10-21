import { useEffect, useRef, useState } from 'react'
import FreePlay from './piano/FreePlay'

const pages = {
  home: 'Home',
  'free-play': 'Free play',
  practice: 'Practice',
} as const
type Page = keyof typeof pages

function currentPage(): Page | 'not-found' {
  const path = window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '')
  if (!path) return 'home'
  return Object.hasOwn(pages, path) ? path as Page : 'not-found'
}

function PianoStudy() {
  return <div className="piano-study" aria-hidden="true">
    <div className="study-caption"><span>A space for listening</span><span>01 / PIANO</span></div>
    <div className="roll-art">
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <span className="roll-line" key={i} />)}
      <i className="note-bar note-a" /><i className="note-bar note-b" />
      <i className="note-bar note-c" /><i className="note-bar note-d" />
      <i className="note-bar note-e" /><i className="note-bar note-f" />
    </div>
    <div className="keyboard-art">
      {Array.from({ length: 14 }, (_, i) => <span key={i} className={`white-key ${[2, 5, 9].includes(i) ? 'tinted' : ''}`}>
        {![2, 6].includes(i % 7) && i !== 13 && <i className="black-key" />}
      </span>)}
    </div>
    <div className="study-foot"><span>Listen closely.</span><span>There’s music in the details.</span></div>
  </div>
}

function Home() {
  return <>
    <section className="hero" aria-labelledby="home-title">
      <div className="hero-copy">
        <p className="eyebrow">AURIS DOCTA · THE TRAINED EAR</p>
        <h1 id="home-title">A little closer<br />to the <em>music.</em></h1>
        <p className="intro">Listen, explore, and find the notes.<br className="desktop-break" /> Your own space to build an ear for the piano.</p>
        <a className="button primary" href="#/free-play">Open Free play <span aria-hidden="true">↗</span></a>
        <p className="quiet hero-note">Your piano is ready. More ways to practice are on the way.</p>
      </div>
      <PianoStudy />
    </section>
    <section className="paths" aria-labelledby="paths-title">
      <div className="section-heading"><h2 id="paths-title">Make room for practice.</h2><span className="eyebrow">AT YOUR OWN PACE</span></div>
      <div className="path-grid">
        <a className="path-card" href="#/free-play">
          <div className="card-top"><span className="path-number">01</span><span className="status">Ready to play</span></div>
          <h3>Free play <span aria-hidden="true">↗</span></h3>
          <p>A piano to explore a melody, find a chord, or follow your curiosity.</p>
          <span className="card-bottom">A place to begin</span>
        </a>
        <a className="path-card" href="#/practice">
          <div className="card-top"><span className="path-number">02</span><span className="status">On the way</span></div>
          <h3>Train your ear <span aria-hidden="true">↗</span></h3>
          <p>Hear a phrase. Find its pitches. See how the pieces fit together.</p>
          <span className="card-bottom">From one note to a whole passage</span>
        </a>
        <div className="path-card future-card">
          <div className="card-top"><span className="path-number">03</span><span className="status">Later</span></div>
          <h3>Your collection</h3>
          <p>Keep the exercises you love and return to them whenever you like.</p>
          <span className="card-bottom">Sessions, favorites & progress</span>
        </div>
      </div>
    </section>
  </>
}

function PracticePreview() {
  return <section className="preview-page" aria-labelledby="preview-title">
    <div className="preview-copy">
      <a className="back-link" href="#/home">← Back home</a>
      <p className="eyebrow">02 / TRAIN YOUR EAR</p>
      <h1 id="preview-title">Listen. Find.<br /><em>Understand.</em></h1>
      <p className="intro">Turn what you hear into notes you know.</p>
      <div className="coming-message" role="status">
        <span className="status">On the way</span>
        <p>Listening exercises, answer entry, and visual feedback are coming next. Practice is not available yet.</p>
      </div>
      <a className="text-link" href="#/free-play">Open Free play <span aria-hidden="true">→</span></a>
    </div>
    <PianoStudy />
  </section>
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
    document.title = `${page === 'not-found' ? 'Page not found' : pages[page]} · Auris Docta`
    if (initial.current) { initial.current = false; return }
    main.current?.focus()
    window.scrollTo(0, 0)
  }, [page])
  return <div className={`app-shell${page === 'free-play' ? ' is-free-play' : ''}`}>
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); main.current?.focus() }}>Skip to content</a>
    <header className="site-header">
      <a className="brand" href="#/home" aria-label="Auris Docta home"><span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span><span>Auris Docta<span className="brand-subtitle">PIANO & EAR TRAINING</span></span></a>
      <nav aria-label="Main navigation">{(Object.keys(pages) as Page[]).map(key => <a href={`#/${key}`} key={key} aria-current={page === key ? 'page' : undefined}>{pages[key]}</a>)}</nav>
      <span className="preview-label">EARLY PREVIEW</span>
    </header>
    <main id="main-content" ref={main} tabIndex={-1}>
      {page === 'home' ? <Home /> : page === 'free-play' ? <FreePlay /> : page === 'not-found' ? <section className="not-found"><p className="eyebrow">PAGE NOT FOUND</p><h1>Let’s find our way back.</h1><a className="button primary" href="#/home">Back home →</a></section> : <PracticePreview />}
    </main>
    <footer className="site-footer"><span>Auris Docta</span><span>A little listening, every day.</span></footer>
  </div>
}
