import { useEffect, useState } from 'react'
import './FallingNote.css'

function FallingNote({ color, column, onReachBottom }) {
  const [top, setTop] = useState(0)

  useEffect(() => {
    let animationFrame
    let startTime = null

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const nextTop = elapsed * 0.2 // vitesse de chute

      if (nextTop > 400) {
        onReachBottom?.()
        return
      }

      setTop(nextTop)
      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  return (
    <div
      className="falling-note"
      style={{
        top: `${top}px`,
        left: `${column * 100 + 20}px`,
        backgroundColor: color,
      }}
    />
  )
}

export default FallingNote
