import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FiSearch, FiShoppingCart, FiMenu, FiX } from 'react-icons/fi'
import { getEnvioNacional } from '../../lib/api'
import { formatCOP } from '../../lib/format'
import { useCart } from '../../context/CartContext'
import { useTiendaConfig } from '../../context/TiendaConfigContext'
import UserMenu from './UserMenu'
import './Header.css'

const NAV_LINKS = [
  { label: 'iPhone', to: '/catalogo/iphone' },
  { label: 'Ofertas', to: '/catalogo/ofertas' },
  { label: 'Accesorios', to: '/catalogo/accesorios' },
  { label: 'iPad / Mac', to: '/catalogo/ipad-mac' },
  { label: 'Android', to: '/catalogo/android', disabled: true },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [envioGratisDesde, setEnvioGratisDesde] = useState(null)
  const { cantidadTotal, openDrawer } = useCart()
  const { mensaje_barra_superior } = useTiendaConfig()

  useEffect(() => {
    getEnvioNacional()
      .then((envio) => setEnvioGratisDesde(envio?.gratis_desde_monto ?? null))
      .catch(console.error)
  }, [])

  const marqueeText = [
    envioGratisDesde ? `Envío gratis desde ${formatCOP(envioGratisDesde)}` : null,
    mensaje_barra_superior,
  ]
    .filter(Boolean)
    .join(' · ')
    .concat(' · ')

  return (
    <header className="site-header">
      <div className="top-bar">
        <div className="marquee">
          <div className="marquee-track">
            <span>{marqueeText}</span>
            <span>{marqueeText}</span>
          </div>
        </div>
      </div>

      <div className="main-bar">
        <button
          className="menu-toggle"
          aria-label="Abrir menú"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <Link to="/" className="logo">
          MAT<span>CELL</span>
        </Link>

        <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
          <ul>
            {NAV_LINKS.map((link) =>
              link.disabled ? (
                <li key={link.label} className="nav-disabled">
                  <span>{link.label}</span>
                </li>
              ) : (
                <li key={link.label}>
                  <NavLink
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    {link.label}
                  </NavLink>
                </li>
              )
            )}
          </ul>
        </nav>

        <div className="header-actions">
          <div className="search-box">
            <FiSearch size={18} />
            <input type="text" placeholder="Buscar productos..." />
          </div>

          <UserMenu />

          <button className="cart-icon" onClick={openDrawer} aria-label="Abrir carrito">
            <FiShoppingCart size={22} />
            {cantidadTotal > 0 && <span className="cart-count">{cantidadTotal}</span>}
          </button>
        </div>
      </div>
    </header>
  )
}
