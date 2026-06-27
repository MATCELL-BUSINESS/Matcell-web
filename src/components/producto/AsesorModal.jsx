import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { formatCOP } from '../../lib/format'
import { useTiendaConfig } from '../../context/TiendaConfigContext'
import './AsesorModal.css'

export default function AsesorModal({ producto, precio, envio, onClose }) {
  const { whatsapp } = useTiendaConfig()
  const [form, setForm] = useState({
    nombre: '',
    departamento: '',
    ciudad: '',
    correo: '',
  })

  const precioProducto = precio ?? producto.precio
  const costoEnvio = envio?.costo ?? 0
  const total = precioProducto + costoEnvio

  const setCampo = (campo) => (e) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }))

  const formValido = form.nombre.trim() && form.departamento.trim() && form.ciudad.trim()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formValido) return

    const lineas = [
      `Hola, quiero finalizar la compra de: ${producto.nombre}`,
      `Precio: ${formatCOP(precioProducto)}`,
      `Envío estimado: ${formatCOP(costoEnvio)}`,
      `Total: ${formatCOP(total)}`,
      '',
      `Nombre: ${form.nombre}`,
      `Departamento: ${form.departamento}`,
      `Ciudad: ${form.ciudad}`,
    ]
    if (form.correo.trim()) lineas.push(`Correo: ${form.correo}`)

    const mensaje = lineas.join('\n')
    window.open(
      `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`,
      '_blank',
      'noopener,noreferrer'
    )
    onClose()
  }

  return (
    <div className="asesor-modal-backdrop" onClick={onClose}>
      <div className="asesor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="asesor-modal-header">
          <h3>Finalizar compra con un asesor</h3>
          <button onClick={onClose} aria-label="Cerrar">
            <FiX size={20} />
          </button>
        </div>

        <div className="asesor-modal-resumen">
          <p>{producto.nombre}</p>
          <div className="asesor-modal-totales">
            <span>Producto</span>
            <span>{formatCOP(precioProducto)}</span>
          </div>
          <div className="asesor-modal-totales">
            <span>Envío estimado</span>
            <span>{formatCOP(costoEnvio)}</span>
          </div>
          <div className="asesor-modal-totales total">
            <span>Total</span>
            <span>{formatCOP(total)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Nombre completo
            <input value={form.nombre} onChange={setCampo('nombre')} required />
          </label>
          <label>
            Departamento
            <input value={form.departamento} onChange={setCampo('departamento')} required />
          </label>
          <label>
            Ciudad
            <input value={form.ciudad} onChange={setCampo('ciudad')} required />
          </label>
          <label>
            Correo (opcional)
            <input type="email" value={form.correo} onChange={setCampo('correo')} />
          </label>

          <button type="submit" className="btn btn-primary" disabled={!formValido}>
            Continuar por WhatsApp
          </button>
        </form>
      </div>
    </div>
  )
}
