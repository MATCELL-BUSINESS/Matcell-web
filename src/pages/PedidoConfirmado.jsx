import { useEffect, useState } from 'react'
import { useLocation, useSearchParams, Link, Navigate } from 'react-router-dom'
import { FiCheckCircle } from 'react-icons/fi'
import { getConfirmacionPedido } from '../lib/api'
import { formatCOP } from '../lib/format'
import './PedidoConfirmado.css'

export default function PedidoConfirmado() {
  const { state } = useLocation()
  const [searchParams] = useSearchParams()
  const numeroPedidoUrl = searchParams.get('pedido')

  const [pedido, setPedido] = useState(
    state?.numeroPedido
      ? { numeroPedido: state.numeroPedido, total: state.total, nombre: state.nombre }
      : null
  )
  const [cargando, setCargando] = useState(!state?.numeroPedido && !!numeroPedidoUrl)
  const [noEncontrado, setNoEncontrado] = useState(false)

  useEffect(() => {
    // Si ya tenemos los datos por navegación en memoria (pago aprobado en el
    // mismo navegador vía el widget), no hace falta consultar la base. Si
    // venimos de una redirección de página completa (ej. PSE), los
    // recuperamos por número de pedido a través de una función mínima que
    // nunca expone dirección/teléfono del cliente.
    if (state?.numeroPedido || !numeroPedidoUrl) return

    getConfirmacionPedido(numeroPedidoUrl)
      .then((data) => {
        if (!data) {
          setNoEncontrado(true)
          return
        }
        setPedido({
          numeroPedido: data.numero_pedido,
          total: data.total,
          nombre: data.cliente_nombre,
        })
      })
      .catch(() => setNoEncontrado(true))
      .finally(() => setCargando(false))
  }, [state, numeroPedidoUrl])

  if (cargando) {
    return <div className="pedido-confirmado-vacio" />
  }

  if (!pedido || noEncontrado) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="pedido-confirmado">
      <FiCheckCircle size={56} className="pedido-confirmado-icono" />
      <h1>¡Gracias por tu compra, {pedido.nombre}!</h1>
      <p className="pedido-confirmado-numero">
        Pedido <strong>{pedido.numeroPedido}</strong>
      </p>
      <p className="pedido-confirmado-total">{formatCOP(pedido.total)}</p>

      <p className="pedido-confirmado-texto">
        Tu pedido quedó registrado. En unos minutos confirmamos el estado de
        tu pago y un asesor se pondrá en contacto contigo para coordinar tu
        envío.
      </p>

      <Link to="/" className="btn btn-primary">
        Volver al inicio
      </Link>
    </div>
  )
}
