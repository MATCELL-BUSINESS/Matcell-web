import { FiShoppingCart, FiPackage, FiHome } from 'react-icons/fi'
import './DeliveryEstimate.css'

const FESTIVOS = [
  '2025-01-01','2025-01-06','2025-03-24','2025-04-17','2025-04-18','2025-05-01',
  '2025-06-02','2025-06-23','2025-06-30','2025-07-20','2025-08-07','2025-08-18',
  '2025-10-13','2025-11-03','2025-11-17','2025-12-08','2025-12-25',
  '2026-01-01','2026-01-12','2026-03-23','2026-04-02','2026-04-03','2026-05-01',
  '2026-05-18','2026-06-08','2026-06-15','2026-06-29','2026-07-20','2026-08-07',
  '2026-08-17','2026-10-12','2026-11-02','2026-11-16','2026-12-08','2026-12-25',
]

function toLocalDateStr(fecha) {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function esDiaHabil(fecha) {
  const dia = fecha.getDay()
  return dia !== 0 && dia !== 6 && !FESTIVOS.includes(toLocalDateStr(fecha))
}

function siguienteDiaHabil(fecha) {
  const sig = new Date(fecha)
  sig.setDate(sig.getDate() + 1)
  while (!esDiaHabil(sig)) sig.setDate(sig.getDate() + 1)
  return sig
}

function calcularFechaDespacho() {
  const ahora = new Date()
  if (esDiaHabil(ahora) && ahora.getHours() < 15) return ahora
  return siguienteDiaHabil(ahora)
}

function calcularRangoEntrega(despacho) {
  let n = 0
  const min = new Date(despacho)
  while (n < 3) { min.setDate(min.getDate() + 1); if (esDiaHabil(min)) n++ }
  n = 0
  const max = new Date(despacho)
  while (n < 5) { max.setDate(max.getDate() + 1); if (esDiaHabil(max)) n++ }
  return { min, max }
}

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function fmtCorta(d) {
  return `${d.getDate()} ${MESES[d.getMonth()]}`
}

export default function DeliveryEstimate() {
  const ahora = new Date()
  const esDiaHabilHoy = esDiaHabil(ahora)
  const anteDe3pm = ahora.getHours() < 15
  const despacho = calcularFechaDespacho()
  const { min, max } = calcularRangoEntrega(despacho)

  const hoy = ahora
  const entregaRango = `${fmtCorta(min)} – ${fmtCorta(max)}`
  const despachoLabel = esDiaHabilHoy && anteDe3pm
    ? `Hoy ${fmtCorta(hoy)}`
    : fmtCorta(despacho)

  const mensajeCaja = esDiaHabilHoy && anteDe3pm
    ? 'Pide antes de las 3pm — tu pedido sale hoy mismo'
    : 'Pide ahora — tu pedido sale mañana a primera hora'

  return (
    <div className="delivery-timeline-wrap">
      <div className="delivery-timeline">
        {/* Paso 1 */}
        <div className="dt-step">
          <div className="dt-circle dt-circle--black">
            <FiShoppingCart size={16} />
          </div>
          <p className="dt-fecha">{fmtCorta(hoy)}</p>
          <p className="dt-label">Compra</p>
        </div>

        <div className="dt-line dt-line--red" />

        {/* Paso 2 */}
        <div className="dt-step">
          <div className="dt-circle dt-circle--red">
            <FiPackage size={16} />
          </div>
          <p className="dt-fecha">{despachoLabel}</p>
          <p className="dt-label">Despachamos</p>
        </div>

        <div className="dt-line dt-line--gray" />

        {/* Paso 3 */}
        <div className="dt-step">
          <div className="dt-circle dt-circle--light">
            <FiHome size={16} />
          </div>
          <p className="dt-fecha">{entregaRango}</p>
          <p className="dt-label">Entrega</p>
        </div>
      </div>

      <div className="dt-caja">
        <span className="dt-rayo">⚡</span>
        <p>{mensajeCaja}</p>
      </div>
    </div>
  )
}
