import { FiBox, FiRefreshCw, FiHeadphones } from 'react-icons/fi'
import './WarrantyBlock.css'

const WARRANTIES = [
  {
    icon: FiBox,
    months: '12',
    title: 'Equipos nuevos',
    desc: 'Cobertura total por defectos de fábrica o funcionamiento.',
  },
  {
    icon: FiRefreshCw,
    months: '3',
    title: 'Equipos seminuevos',
    desc: 'Cambios y soporte directo si tu equipo presenta fallas.',
  },
  {
    icon: FiHeadphones,
    months: '1',
    title: 'Accesorios y complementos',
    desc: 'Cobertura por defectos de fábrica en accesorios.',
  },
]

export default function WarrantyBlock() {
  return (
    <section className="warranty-block">
      <h2>Garantías que sí cumplimos</h2>
      <div className="warranty-grid">
        {WARRANTIES.map(({ icon: Icon, months, title, desc }) => (
          <div key={title} className="warranty-card">
            <Icon size={26} />
            <p className="warranty-months">
              {months} <span>{months === '1' ? 'mes' : 'meses'}</span>
            </p>
            <h3>{title}</h3>
            <p className="warranty-desc">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
