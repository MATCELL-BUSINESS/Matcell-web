import { Link } from 'react-router-dom'
import { FiShield, FiTruck, FiRefreshCw, FiAward } from 'react-icons/fi'
import './Hero.css'

const TRUST_ITEMS = [
  { icon: FiShield, label: 'Garantía hasta 12 meses' },
  { icon: FiTruck, label: 'Envío a toda Colombia' },
  { icon: FiRefreshCw, label: '30 días para cambios' },
  { icon: FiAward, label: 'Certificación por técnicos' },
]

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-badge">100% certificado</span>
        <h1>
          iPhone certificado. Mitad de precio.
          <br />
          Misma experiencia.
        </h1>
        <p className="hero-subtext">
          Más de 1.200 clientes en Colombia ya compraron con nosotros y
          renovaron su iPhone sin pagar precio de nuevo.
        </p>

        <div className="hero-cta">
          <Link to="/categoria/iphone" className="btn btn-primary">
            Ver catálogo
          </Link>
          <Link to="/como-certificamos" className="btn btn-secondary">
            Cómo certificamos
          </Link>
        </div>

        <ul className="trust-bar">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <li key={label}>
              <Icon size={18} />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
