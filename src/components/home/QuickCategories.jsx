import { Link } from 'react-router-dom'
import { FaApple } from 'react-icons/fa'
import { FiTag, FiSmartphone, FiHeadphones } from 'react-icons/fi'
import './QuickCategories.css'

const ICONS_BY_SLUG = {
  iphone: FaApple,
  android: FiSmartphone,
  accesorios: FiHeadphones,
}

function IpadMacIcon(props) {
  return (
    <svg
      width={26}
      height={26}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="13" y="2" width="8" height="11" rx="1" />
      <path d="M2 18.5C2 17.67 2.67 17 3.5 17h13c.83 0 1.5.67 1.5 1.5v0c0 .83-.67 1.5-1.5 1.5h-13C2.67 20 2 19.33 2 18.5Z" />
      <path d="M2 17V8a1 1 0 0 1 1-1h10" />
    </svg>
  )
}

const OFERTAS_CARD = {
  id: 'ofertas',
  nombre: 'Ofertas',
  to: '/catalogo/ofertas',
  icon: FiTag,
  highlight: true,
}

export default function QuickCategories({ categorias = [] }) {
  const cards = categorias.map((cat) => ({
    id: cat.id,
    nombre: cat.nombre,
    to: `/catalogo/${cat.slug}`,
    icon:
      ICONS_BY_SLUG[cat.slug] ||
      (cat.slug === 'ipad-mac' ? IpadMacIcon : FiTag),
  }))

  if (cards.length > 0) {
    cards.splice(1, 0, OFERTAS_CARD)
  } else {
    cards.push(OFERTAS_CARD)
  }

  return (
    <section className="quick-categories">
      <h2>Compra por categoría</h2>
      <div className="categories-grid">
        {cards.map(({ icon: Icon, highlight, ...cat }) => (
          <Link
            key={cat.id}
            to={cat.to}
            className={`category-card ${highlight ? 'highlight' : ''}`}
          >
            <Icon size={26} />
            <span>{cat.nombre}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
