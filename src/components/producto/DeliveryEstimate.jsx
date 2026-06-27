import { FiTruck } from 'react-icons/fi'
import { formatFechaCorta, sumarDias } from '../../lib/format'
import './DeliveryEstimate.css'

export default function DeliveryEstimate({ envio }) {
  if (!envio?.dias_min || !envio?.dias_max) return null

  const hoy = new Date()
  const fechaMin = formatFechaCorta(sumarDias(hoy, envio.dias_min))
  const fechaMax = formatFechaCorta(sumarDias(hoy, envio.dias_max))

  return (
    <div className="delivery-estimate">
      <FiTruck size={18} />
      <p>
        Pide hoy y recíbelo entre el <strong>{fechaMin}</strong> y el{' '}
        <strong>{fechaMax}</strong>
      </p>
    </div>
  )
}
