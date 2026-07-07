import { useState, useEffect, useRef, useCallback } from 'react'
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import './ProductReviews.css'

const INTERVALO = 4000
const CARD_HEIGHT = 160

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
  return (
    <div className="review-card">
      <Stars rating={resena.calificacion} />
      <p className="review-comment">"{resena.comentario}"</p>
      <p className="review-author">
        {resena.nombre_cliente}
        {resena.ciudad && <span> · {resena.ciudad}</span>}
      </p>
    </div>
  )
}

export default function ProductReviews({ resenas = [], esEspecifica }) {
  const [perView, setPerView] = useState(1)
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)
  const touchStartX = useRef(null)

  useEffect(() => {
    const update = () => setPerView(window.innerWidth >= 768 ? 2 : 1)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Group reviews into pages of `perView`
  const pages = []
  for (let i = 0; i < resenas.length; i += perView) {
    pages.push(resenas.slice(i, i + perView))
  }
  const maxIndex = Math.max(0, pages.length - 1)

  const siguiente = useCallback(() => {
    setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(siguiente, INTERVALO)
  }, [siguiente])

  useEffect(() => {
    if (pages.length <= 1) return
    timerRef.current = setInterval(siguiente, INTERVALO)
    return () => clearInterval(timerRef.current)
  }, [siguiente, pages.length])

  // Clamp current when perView changes
  useEffect(() => {
    setCurrent((prev) => Math.min(prev, maxIndex))
  }, [maxIndex])

  const irA = (idx) => {
    setCurrent(Math.min(Math.max(idx, 0), maxIndex))
    resetTimer()
  }

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? irA(current + 1) : irA(current - 1)
    touchStartX.current = null
  }

  if (resenas.length === 0) return null

  const promedio = resenas.reduce((s, r) => s + r.calificacion, 0) / resenas.length
  // translateX: each page is 100% of the track, track width = pages.length × 100% of viewport
  const translatePct = pages.length > 0 ? current * (100 / pages.length) : 0

  return (
    <section className="product-reviews">
      <div className="reviews-header">
        <div>
          <h2>{esEspecifica ? 'Reseñas de este equipo' : 'Lo que dicen nuestros clientes'}</h2>
          <div className="reviews-avg">
            <Stars rating={promedio} size={16} />
            <span className="reviews-avg-num">{promedio.toFixed(1)}</span>
            <span className="reviews-avg-count">
              basado en {resenas.length} reseña{resenas.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {pages.length > 1 && (
          <div className="reviews-arrows">
            <button className="reviews-arrow" onClick={() => irA(current - 1)} disabled={current === 0} aria-label="Anterior">
              <FiChevronLeft size={20} />
            </button>
            <button className="reviews-arrow" onClick={() => irA(current + 1)} disabled={current >= maxIndex} aria-label="Siguiente">
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
          style={{
            width: `${pages.length * 100}%`,
            transform: `translateX(-${translatePct}%)`,
          }}
        >
          {pages.map((pagina, pi) => (
            <div key={pi} className="reviews-page" style={{ width: `${100 / pages.length}%` }}>
              {pagina.map((resena) => (
                <ReviewCard key={resena.id} resena={resena} />
              ))}
              {/* Rellena con placeholder si la última página tiene menos cards */}
              {pagina.length < perView &&
                Array.from({ length: perView - pagina.length }).map((_, i) => (
                  <div key={`placeholder-${i}`} className="review-card review-card--empty" />
                ))}
            </div>
          ))}
        </div>
      </div>

      {pages.length > 1 && (
        <div className="reviews-dots">
          {pages.map((_, i) => (
            <button
              key={i}
              className={`reviews-dot ${i === current ? 'active' : ''}`}
              onClick={() => irA(i)}
              aria-label={`Página ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
