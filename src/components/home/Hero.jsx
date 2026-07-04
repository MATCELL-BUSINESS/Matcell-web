import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './Hero.css'

const BANNERS = [
  {
    desktop: 'https://qdclzxubnanrbyutcngc.supabase.co/storage/v1/object/public/assets/hero-desktop.jpg.jpeg',
    mobile: 'https://qdclzxubnanrbyutcngc.supabase.co/storage/v1/object/public/assets/hero-mobile.jpg.jpeg',
    boton: 'Ver iPhones →',
    href: '/catalogo/iphone',
    alt: 'iPhone certificado — Mitad de precio, misma experiencia',
  },
  {
    desktop: 'https://qdclzxubnanrbyutcngc.supabase.co/storage/v1/object/public/assets/hero%20accesorios%20pc.png',
    mobile: 'https://qdclzxubnanrbyutcngc.supabase.co/storage/v1/object/public/assets/hero%20accesorios%20movil.png',
    boton: 'Ver accesorios →',
    href: '/catalogo/accesorios',
    alt: 'Accesorios para iPhone — Forros, cables y más',
  },
]

const INTERVALO = 5000

export default function Hero() {
  const [activo, setActivo] = useState(0)
  const timerRef = useRef(null)
  const touchStartX = useRef(null)

  const irA = useCallback((idx) => {
    setActivo(idx)
  }, [])

  const siguiente = useCallback(() => {
    setActivo((prev) => (prev + 1) % BANNERS.length)
  }, [])

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(siguiente, INTERVALO)
  }, [siguiente])

  useEffect(() => {
    timerRef.current = setInterval(siguiente, INTERVALO)
    return () => clearInterval(timerRef.current)
  }, [siguiente])

  const handleDotClick = (idx) => {
    irA(idx)
    resetTimer()
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      setActivo((prev) =>
        diff > 0
          ? (prev + 1) % BANNERS.length
          : (prev - 1 + BANNERS.length) % BANNERS.length
      )
      resetTimer()
    }
    touchStartX.current = null
  }

  return (
    <section
      className="hero"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="hero-track"
        style={{ transform: `translateX(-${activo * 100}%)` }}
      >
        {BANNERS.map((banner, i) => (
          <div key={i} className="hero-slide">
            <picture>
              <source media="(max-width: 767px)" srcSet={banner.mobile} />
              <img
                src={banner.desktop}
                alt={banner.alt}
                className="hero-img"
              />
            </picture>
            <div className="hero-overlay">
              <Link to={banner.href} className="hero-cta-btn">
                {banner.boton}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="hero-dots">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === activo ? 'active' : ''}`}
            onClick={() => handleDotClick(i)}
            aria-label={`Banner ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
