import { useState, useEffect, useRef, useCallback } from 'react'
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import './ProductReviews.css'

function Stars({ rating, size = 14 }) {
  return (
    <div className="review-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar key={i} size={size} fill={i < Math.round(rating) ? 'currentColor' : 'none'} />
      ))}
    </div>
  )
}

function ReviewCard({ resena }) {
  const [expanded, setExpanded] = useState(false)
  const LIMIT = 160
  const long = resena.comentario.length > LIMIT

  return (
    <div className="product-review-card-inner">
      <Stars rating={resena.calificacion} />
      <p className="review-comment">
        "{expanded || !long ? resena.comentario : resena.comentario.slice(0, LIMIT) + '…'}"
      </p>
      {long && (
        <button className="review-ver-mas" onClick={() => setExpanded((e) => !e)}>
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
      <p className="review-author">
        {resena.nombre_cliente}
        {resena.ciudad && <span> &middot; {resena.ciudad}</span>}
      </p>
    </div>
  )
}

const INTERVALO = 4000

export default function ProductReviews({ resenas = [], esEspecifica }) {
  const [current, setCurrent] = useState(0)
  const [perView, setPerView] = useState(1)
  const timerRef = useRef(null)
  const touchStartX = useRef(null)

  useEffect(() => {
    const update = () =>
      setPerView(window.innerWidth >= 900 ? 3 : window.innerWidth >= 600 ? 2 : 1)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const maxIndex = Math.max(0, resenas.length - perView)

  const siguiente = useCallback(() => {
    setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(siguiente, INTERVALO)
  }, [siguiente])

  useEffect(() => {
    if (resenas.length <= perView) return
    timerRef.current = setInterval(siguiente, INTERVALO)
    return () => clearInterval(timerRef.current)
  }, [siguiente, resenas.length, perView])

  const irA = (idx) => {
    setCurrent(Math.min(Math.max(idx, 0), maxIndex))
    resetTimer()
  }

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      diff > 0 ? irA(current + 1) : irA(current - 1)
    }
    touchStartX.current = null
  }

  if (resenas.length === 0) return null

  const promedio = resenas.reduce((s, r) => s + r.calificacion, 0) / resenas.length
  const cardPct = 100 / perView

  return (
    <section className="product-reviews">
      <div className="reviews-header">
        <div>
          <h2>{esEspecifica ? 'Reseñas de este equipo' : 'Lo que dicen nuestros clientes'}</h2>
          <div className="reviews-avg">
            <Stars rating={promedio} size={16} />
            <span className="reviews-avg-num">{promedio.toFixed(1)}</span>
            <span className="reviews-avg-count">basado en {resenas.length} reseña{resenas.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {resenas.length > perView && (
          <div className="reviews-arrows">
            <button
              className="reviews-arrow"
              onClick={() => irA(current - 1)}
              disabled={current === 0}
              aria-label="Anterior"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              className="reviews-arrow"
              onClick={() => irA(current + 1)}
              disabled={current >= maxIndex}
              aria-label="Siguiente"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <div
        className="reviews-viewport"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="reviews-track"
          style={{ transform: `translateX(-${current * cardPct}%)` }}
        >
          {resenas.map((resena) => (
            <div
              key={resena.id}
              className="product-review-card"
              style={{ minWidth: `${cardPct}%` }}
            >
              <ReviewCard resena={resena} />
            </div>
          ))}
        </div>
      </div>

      {resenas.length > perView && (
        <div className="reviews-dots">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              className={`reviews-dot ${i === current ? 'active' : ''}`}
              onClick={() => irA(i)}
              aria-label={`Reseña ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
