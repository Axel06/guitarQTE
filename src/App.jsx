import { useEffect, useRef, useState } from 'react'
import './Track.css'
import { notesMap } from './notesMap'

const frets = [
  { key: 'a', color: 'green' },
  { key: 'z', color: 'red' },
  { key: 'e', color: 'yellow' },
  { key: 'r', color: 'blue' },
  { key: 't', color: 'orange' }
]

function App() {
  const [notes, setNotes] = useState([])
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [started, setStarted] = useState(false)
  const audioRef = useRef()
  const startTimeRef = useRef()
  const noteIndexRef = useRef(0)

  // ➤ Lancer la musique + synchronisation
  const startGame = () => {
    setStarted(true)
    audioRef.current.play()
    startTimeRef.current = performance.now()
    noteIndexRef.current = 0
  }

  // ➤ Générer les notes au bon moment
  useEffect(() => {
    if (!started) return
    const checkNotes = () => {
      const now = performance.now() - startTimeRef.current
      while (
        noteIndexRef.current < notesMap.length &&
        notesMap[noteIndexRef.current].time <= now
      ) {
        const noteData = notesMap[noteIndexRef.current]
        const note = {
          id: Date.now() + Math.random(),
          lane: noteData.lane,
          top: 0,
          color: frets[noteData.lane].color
        }
        setNotes(prev => [...prev, note])
        noteIndexRef.current++
      }
      requestAnimationFrame(checkNotes)
    }
    requestAnimationFrame(checkNotes)
  }, [started])

  // ➤ Animation descendante + miss auto
  useEffect(() => {
    const animate = () => {
      setNotes(prev =>
        prev
          .map(note => ({ ...note, top: note.top + 4 }))
          .filter(note => {
            if (note.top >= 600) {
              setFeedback('Miss')
              setTimeout(() => setFeedback(''), 500)
              return false
            }
            return true
          })
      )
      requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [])

  // ➤ Détection clavier (hit ou miss)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase()
      const fretIndex = frets.findIndex(f => f.key === key)
      if (fretIndex === -1) return

      let hit = false
      setNotes(prevNotes => {
        const updated = [...prevNotes]
        const index = updated.findIndex(note =>
          note.lane === fretIndex && note.top >= 500 && note.top <= 560
        )
        if (index !== -1) {
          updated.splice(index, 1)
          setScore(prev => prev + 1)
          setFeedback('Perfect')
          setTimeout(() => setFeedback(''), 500)
          hit = true
        }
        return updated
      })

      if (!hit) {
        setFeedback('Miss')
        setTimeout(() => setFeedback(''), 500)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [notes])

  return (
    <div className="hero-container">
      <audio ref={audioRef} src="/song.mp3" />

      {!started && (
        <button className="start-button" onClick={startGame}>
          ▶ Lancer la musique
        </button>
      )}

      <div className="scoreboard">Score : {score}</div>

      {feedback && (
        <div className={`feedback ${feedback === 'Miss' ? 'miss' : ''}`}>
          {feedback}
        </div>
      )}

      <div className="track-wrapper">
        <div className="track">
          {frets.map((fret, index) => (
            <div className="lane" key={index}>
              {notes
                .filter(note => note.lane === index)
                .map(note => (
                  <div
                    key={note.id}
                    className="note"
                    style={{
                      top: `${note.top}px`,
                      backgroundColor: note.color
                    }}
                  />
                ))}
              <div className={`hit-zone ${fret.color}`}>{fret.key.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
