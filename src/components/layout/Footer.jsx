import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiInstagram,
  FiFacebook,
  FiChevronDown,
} from 'react-icons/fi'
import { FaWhatsapp, FaTiktok } from 'react-icons/fa'
import { useTiendaConfig } from '../../context/TiendaConfigContext'
import './Footer.css'

const CATEGORIAS = [
  { label: 'iPhone',    to: '/catalogo/iphone' },
  { label: 'Ofertas',   to: '/catalogo/ofertas' },
  { label: 'Accesorios',to: '/catalogo/accesorios' },
  { label: 'iPad / Mac',to: '/catalogo/ipad-mac' },
]

const POLITICAS = [
  { label: 'Términos y condiciones', to: '/politicas#terminos' },
  { label: 'Política de privacidad', to: '/politicas#privacidad' },
  { label: 'Cambios y devoluciones', to: '/politicas#cambios' },
]

function FooterColumn({ title, links }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`footer-col ${open ? 'open' : ''}`}>
      <button
        className="footer-col-title"
        onClick={() => setOpen((o) => !o)}
      >
        {title}
        <FiChevronDown className="chevron" />
      </button>
      <ul className="footer-col-links">
        {links.map((link) => (
          <li key={link.label}>
            {link.external
              ? <a href={link.to} target="_blank" rel="noopener noreferrer">{link.label}</a>
              : <Link to={link.to}>{link.label}</Link>
            }
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  const { whatsapp, instagram_url, facebook_url, tiktok_url, descripcion_footer } =
    useTiendaConfig()

  const AYUDA = [
    { label: 'Envíos',               to: '/politicas#envios' },
    { label: 'Garantía',             to: '/politicas#garantia' },
    { label: 'Términos',             to: '/politicas#terminos' },
    { label: 'Contacto por WhatsApp',to: `https://wa.me/${whatsapp}`, external: true },
  ]
  const whatsappHref = `https://wa.me/${whatsapp}`

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <p className="wordmark">
            MAT<span>CELL</span>
          </p>
          <p className="brand-desc">{descripcion_footer}</p>

          <div className="social-icons">
            <a href={instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FiInstagram size={20} />
            </a>
            <a href={facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FiFacebook size={20} />
            </a>
            <a href={tiktok_url} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <FaTiktok size={18} />
            </a>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <FaWhatsapp size={20} />
            </a>
          </div>
        </div>

        <div className="footer-cols">
          <FooterColumn title="Categorías" links={CATEGORIAS} />
          <FooterColumn title="Ayuda"      links={AYUDA} />
          <FooterColumn title="Políticas"  links={POLITICAS} />
        </div>
      </div>

      <div className="footer-payments">
        <span>Métodos de pago:</span>
        <div className="payment-badges">
          <span className="badge">Tarjeta crédito/débito</span>
          <span className="badge">PSE</span>
          <span className="badge">Crédito Nequi</span>
          <span className="badge">Bancolombia BNPL</span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MatCell. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
