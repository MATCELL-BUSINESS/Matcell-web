import { FiTruck } from 'react-icons/fi'
import { formatCOP } from '../../lib/format'
import './ShippingProgress.css'

export default function ShippingProgress({ subtotal, montoGratis }) {
  if (!montoGratis) return null

  const desbloqueado = subtotal >= montoGratis
  const porcentaje = Math.min(100, Math.round((subtotal / montoGratis) * 100))
  const faltante = montoGratis - subtotal

  return (
    <div className={`shipping-progress ${desbloqueado ? 'desbloqueado' : ''}`}>
      <div className="shipping-progress-header">
        <FiTruck size={16} />
        <span>
          {desbloqueado
            ? '¡Envío gratis desbloqueado! 🎉'
            : `Te faltan ${formatCOP(faltante)} para envío gratis`}
        </span>
      </div>
      <div className="shipping-progress-bar">
        <div className="shipping-progress-fill" style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  )
}
