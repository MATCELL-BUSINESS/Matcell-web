import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { FiChevronDown, FiPackage } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { getMisPedidos } from '../lib/api'
import { formatCOP } from '../lib/format'
import './MisPedidos.css'

const ESTADO_LABELS = {
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  enviado: 'Enviado',
  en_camino: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const PAGO_LABELS = {
  pendiente: 'Pago pendiente',
  aprobado: 'Pago aprobado',
  rechazado: 'Pago rechazado',
}

function PedidoCard({ pedido }) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className={`pedido-card ${abierto ? 'open' : ''}`}>
      <button className="pedido-card-header" onClick={() => setAbierto((a) => !a)}>
        <div className="pedido-card-info">
          <p className="pedido-numero">{pedido.numero_pedido}</p>
          <p className="pedido-fecha">
            {new Date(pedido.creado_en).toLocaleDateString('es-CO', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="pedido-card-estados">
          <span className={`pedido-badge estado-${pedido.estado_pedido}`}>
            {ESTADO_LABELS[pedido.estado_pedido] ?? pedido.estado_pedido}
          </span>
          <span className={`pedido-badge pago-${pedido.estado_pago}`}>
            {PAGO_LABELS[pedido.estado_pago] ?? pedido.estado_pago}
          </span>
        </div>

        <p className="pedido-total">{formatCOP(pedido.total)}</p>
        <FiChevronDown className="pedido-chevron" />
      </button>

      <div className="pedido-detalle">
        {(pedido.pedido_items ?? []).map((item) => (
          <div key={item.id} className="pedido-item-row">
            <span>
              {item.cantidad}x {item.nombre_producto}
            </span>
            <span>{formatCOP(item.precio_unitario * item.cantidad)}</span>
          </div>
        ))}
        <div className="pedido-item-row total">
          <span>Envío</span>
          <span>{pedido.costo_envio === 0 ? 'Gratis' : formatCOP(pedido.costo_envio)}</span>
        </div>
        <div className="pedido-item-row total">
          <span>Total</span>
          <span>{formatCOP(pedido.total)}</span>
        </div>
      </div>
    </div>
  )
}

export default function MisPedidos() {
  const { user, loading } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!user) return
    getMisPedidos(user.id)
      .then(setPedidos)
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [user])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="mis-pedidos-page">
      <h1>Mis pedidos</h1>

      {cargando && <p className="mis-pedidos-vacio">Cargando tus pedidos...</p>}

      {!cargando && pedidos.length === 0 && (
        <div className="mis-pedidos-vacio">
          <FiPackage size={40} />
          <p>Todavía no tienes pedidos.</p>
          <Link to="/" className="btn btn-primary">
            Ir al catálogo
          </Link>
        </div>
      )}

      <div className="mis-pedidos-lista">
        {pedidos.map((pedido) => (
          <PedidoCard key={pedido.id} pedido={pedido} />
        ))}
      </div>
    </div>
  )
}
