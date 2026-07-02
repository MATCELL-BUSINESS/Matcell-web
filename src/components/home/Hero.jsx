import { Link } from 'react-router-dom'
import './Hero.css'

const HERO_DESKTOP = 'https://qdclzxubnanrbyutcngc.supabase.co/storage/v1/object/public/assets/hero-desktop.jpg.jpeg'
const HERO_MOBILE = 'https://qdclzxubnanrbyutcngc.supabase.co/storage/v1/object/public/assets/hero-mobile.jpg.jpeg'

export default function Hero() {
  return (
    <section className="hero">
      <picture>
        <source media="(max-width: 767px)" srcSet={HERO_MOBILE} />
        <img
          src={HERO_DESKTOP}
          alt="iPhone certificado — Mitad de precio, misma experiencia"
          className="hero-img"
        />
      </picture>

      <div className="hero-overlay">
        <Link to="/catalogo?categoria=iphone" className="hero-cta-btn">
          Ver iPhones →
        </Link>
      </div>
    </section>
  )
}
