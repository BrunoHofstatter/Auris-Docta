import { useEffect } from 'react'
import PianoStudy from './components/PianoStudy'
import StudioBrand from './components/StudioBrand'
import './piano/free-play.css'
import './home.css'

export default function Home() {
  useEffect(() => {
    document.documentElement.dataset.theme = 'studio'
    return () => { delete document.documentElement.dataset.theme }
  }, [])

  return <div className="studio home-studio">
    <header><StudioBrand /></header>
    <h1 className="studio-sr">Auris Docta home</h1>
    <div className="home-layout">
      <PianoStudy captions={false} />
      <nav className="home-menu" aria-label="Main navigation">
        <a className="home-action home-action-primary" href="#/free-play"><span className="home-lamp" aria-hidden="true" />Free play</a>
        <a className="home-action" href="#/practice">Practice</a>
      </nav>
    </div>
  </div>
}
