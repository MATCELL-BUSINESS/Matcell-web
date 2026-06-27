import { Link } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'
import './Breadcrumbs.css'

export default function Breadcrumbs({ current, items }) {
  const middleItems = items ?? (current ? [{ label: current }] : [])

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/">Inicio</Link>
      {middleItems.map((item) => (
        <span key={item.label} className="breadcrumb-item">
          <FiChevronRight size={14} />
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  )
}
