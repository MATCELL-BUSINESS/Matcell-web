import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiCheck, FiMapPin, FiInfo, FiAlertCircle } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { crearPedido } from '../lib/api'
import { supabase } from '../lib/supabaseClient'
import { formatCOP } from '../lib/format'
import { DEPARTAMENTOS, MUNICIPIOS } from '../lib/municipios'
import './Checkout.css'

const PASOS = ['Datos', 'Envío', 'Pago']
const WHATSAPP_URL = 'https://wa.me/573046789119?text=Hola%2C%20necesito%20ayuda%20con%20el%20env%C3%ADo'

const LOGOS_TRANSPORTADORA = {
  interrapidisimo: 'https://qdclzxubnanrbyutcngc.supabase.co/storage/v1/object/public/assets/logo%20interrapidisimo.png',
  coordinadora:    'https://qdclzxubnanrbyutcngc.supabase.co/storage/v1/object/public/assets/logo%20coordinadora.avif',
  servientrega:    'https://qdclzxubnanrbyutcngc.supabase.co/storage/v1/object/public/assets/lgo-servientrega-1.webp',
  tcc:             'https://qdclzxubnanrbyutcngc.supabase.co/storage/v1/object/public/assets/Logo_TCC.svg.webp',
}

function getLogoTransportadora(nombre) {
  return LOGOS_TRANSPORTADORA[nombre?.toLowerCase()]
}

// ── Combobox con búsqueda ─────────────────────────────────────────────────────
function Combobox({ value, onChange, opciones, placeholder, disabled }) {
  const [query, setQuery] = useState(value ?? '')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => { setQuery(value ?? '') }, [value])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtradas = query
    ? opciones.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : opciones

  const handleChange = (e) => {
    setQuery(e.target.value)
    onChange(e.target.value)
    setOpen(true)
  }

  const handleSelect = (opcion) => {
    setQuery(opcion)
    onChange(opcion)
    setOpen(false)
  }

  return (
    <div className="combobox" ref={ref}>
      <input
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {open && filtradas.length > 0 && (
        <ul className="combobox-list">
          {filtradas.slice(0, 60).map((o) => (
            <li key={o} onMouseDown={() => handleSelect(o)}>
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [paso, setPaso] = useState(1)
  const [datosCliente, setDatosCliente] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    departamento: '',
    ciudad: '',
  })

  // ── Estado envío Heka ─────────────────────────────────────────────
  const [cotizaciones, setCotizaciones] = useState([])
  const [cotizandoEnvio, setCotizandoEnvio] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState(null)
  const [transportadoraElegida, setTransportadoraElegida] = useState(null)

  // ── Estado pago ───────────────────────────────────────────────────
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    setDatosCliente((d) => ({
      ...d,
      nombre: d.nombre || profile?.nombre || '',
      telefono: d.telefono || profile?.telefono || '',
      email: d.email || user.email || '',
      direccion: d.direccion || profile?.direccion || '',
      departamento: d.departamento || profile?.departamento || '',
      ciudad: d.ciudad || profile?.ciudad || '',
    }))
  }, [user, profile])

  if (items.length === 0) {
    return (
      <div className="checkout-vacio">
        <h1>Tu carrito está vacío</h1>
        <p>Agrega productos antes de continuar al pago.</p>
        <Link to="/" className="btn btn-primary">Ir al catálogo</Link>
      </div>
    )
  }

  const costoEnvio = transportadoraElegida?.precio ?? 0
  const total = subtotal + costoEnvio

  const setCampo = (campo) => (valor) =>
    setDatosCliente((d) => ({ ...d, [campo]: valor }))

  const handleCampoInput = (campo) => (e) =>
    setDatosCliente((d) => ({ ...d, [campo]: e.target.value }))

  const handleDepartamento = (depto) => {
    setDatosCliente((d) => ({ ...d, departamento: depto, ciudad: '' }))
    // Resetear cotización al cambiar departamento
    setCotizaciones([])
    setTransportadoraElegida(null)
    setErrorEnvio(null)
  }

  const handleCiudad = (ciudad) => {
    setCampo('ciudad')(ciudad)
    // Resetear cotización al cambiar ciudad
    setCotizaciones([])
    setTransportadoraElegida(null)
    setErrorEnvio(null)
  }

  const datosValidos =
    datosCliente.nombre.trim() &&
    datosCliente.telefono.trim() &&
    datosCliente.direccion.trim() &&
    datosCliente.departamento.trim() &&
    datosCliente.ciudad.trim()

  // ── Cotizar con Heka al avanzar al paso 2 ────────────────────────
  const handleSiguienteDatos = async (e) => {
    e.preventDefault()
    if (!datosValidos) return

    setPaso(2)
    setCotizandoEnvio(true)
    setErrorEnvio(null)
    setCotizaciones([])
    setTransportadoraElegida(null)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('heka-cotizar', {
        body: { city_name: datosCliente.ciudad, declared_value: subtotal },
      })
      if (fnError || !data) throw fnError ?? new Error('Sin respuesta')
      if (data.error) throw new Error(data.error)
      if (!data.cotizaciones || data.cotizaciones.length === 0) throw new Error('Ciudad no encontrada en Heka')
      setCotizaciones(data.cotizaciones)
    } catch (err) {
      console.error('[Heka]', err)
      setErrorEnvio(err.message ?? 'Error desconocido')
    } finally {
      setCotizandoEnvio(false)
    }
  }

  const handleSiguienteEnvio = () => {
    if (!transportadoraElegida) return
    setPaso(3)
  }

  const handlePagar = async () => {
    setEnviando(true)
    setError(null)

    let pedido
    try {
      pedido = await crearPedido({
        datosCliente,
        envio: { metodo: 'nacional' },
        items,
        subtotal,
        costoEnvio,
        transportadoraElegida: transportadoraElegida?.transportadora ?? null,
        usuarioId: user?.id ?? null,
      })
    } catch (err) {
      console.error(err)
      setError('No pudimos crear tu pedido. Intenta de nuevo en unos segundos.')
      setEnviando(false)
      return
    }

    const numeroPedido = pedido.numero_pedido
    const montoEnCentavos = Math.round(pedido.total * 100)

    try {
      const { data, error: errorFirma } = await supabase.functions.invoke('wompi-firma', {
        body: { referencia: numeroPedido, montoEnCentavos },
      })
      if (errorFirma || !data?.firma) throw errorFirma ?? new Error('Sin firma')

      const esLocalhost = window.location.hostname === 'localhost'
      const checkout = new window.WidgetCheckout({
        currency: 'COP',
        amountInCents: montoEnCentavos,
        reference: numeroPedido,
        publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY,
        signature: { integrity: data.firma },
        ...(esLocalhost
          ? {}
          : { redirectUrl: `${window.location.origin}/pedido-confirmado?pedido=${numeroPedido}` }),
      })

      checkout.open((resultado) => {
        const transaccion = resultado.transaction
        if (transaccion && transaccion.status === 'APPROVED') {
          clearCart()
          navigate(`/pedido-confirmado?pedido=${numeroPedido}`, {
            state: { numeroPedido, total: pedido.total, nombre: datosCliente.nombre },
          })
        } else {
          setError('El pago no se completó. Puedes intentar de nuevo o contactarnos si el dinero fue descontado.')
        }
      })
    } catch (err) {
      console.error(err)
      setError('No pudimos abrir la pasarela de pago. Intenta de nuevo en unos segundos.')
    } finally {
      setEnviando(false)
    }
  }

  const municipiosDepartamento = datosCliente.departamento
    ? (MUNICIPIOS[datosCliente.departamento] ?? [])
    : []

  // ── Sidebar: texto de envío ───────────────────────────────────────
  const sidebarEnvio = () => {
    if (transportadoraElegida) return { texto: formatCOP(transportadoraElegida.precio), verde: false }
    if (cotizandoEnvio) return { texto: 'Calculando...', verde: false }
    return { texto: 'Se calcula al ingresar tu ciudad', verde: false }
  }
  const envioSidebar = sidebarEnvio()

  return (
    <div className="checkout-page">
      <div className="checkout-steps">
        {PASOS.map((label, index) => {
          const numero = index + 1
          const activo = paso === numero
          const completado = paso > numero
          return (
            <div key={label} className={`checkout-step ${activo ? 'active' : ''} ${completado ? 'done' : ''}`}>
              <span className="checkout-step-circle">
                {completado ? <FiCheck size={14} /> : numero}
              </span>
              <span>{label}</span>
            </div>
          )
        })}
      </div>

      <div className="checkout-body">
        {/* ── Paso 1: Datos ── */}
        {paso === 1 && (
          <form className="checkout-form" onSubmit={handleSiguienteDatos}>
            <h2>Datos de contacto y entrega</h2>

            <label>
              Nombre completo
              <input value={datosCliente.nombre} onChange={handleCampoInput('nombre')} required />
            </label>
            <label>
              Teléfono
              <input value={datosCliente.telefono} onChange={handleCampoInput('telefono')} required />
            </label>
            <label>
              Correo (opcional)
              <input type="email" value={datosCliente.email} onChange={handleCampoInput('email')} />
            </label>
            <label>
              Dirección completa
              <input value={datosCliente.direccion} onChange={handleCampoInput('direccion')} required />
            </label>

            <div className="checkout-form-row">
              <label>
                Departamento
                <Combobox
                  value={datosCliente.departamento}
                  onChange={handleDepartamento}
                  opciones={DEPARTAMENTOS}
                  placeholder="Busca tu departamento..."
                />
              </label>
              <label>
                Ciudad / Municipio
                <Combobox
                  value={datosCliente.ciudad}
                  onChange={handleCiudad}
                  opciones={municipiosDepartamento}
                  placeholder={datosCliente.departamento ? 'Busca tu municipio...' : 'Selecciona primero un departamento'}
                  disabled={!datosCliente.departamento}
                />
              </label>
            </div>

            <p className="checkout-ciudad-nota">
              <FiInfo size={13} />
              ¿No encuentras tu municipio? Escríbelo manualmente. También puedes contactarnos por WhatsApp.
            </p>

            <button type="submit" className="btn btn-primary" disabled={!datosValidos}>
              Continuar a envío
            </button>
          </form>
        )}

        {/* ── Paso 2: Envío (Heka) ── */}
        {paso === 2 && (
          <div className="checkout-form">
            <h2>Selecciona tu transportadora</h2>
            <p className="checkout-direccion">
              <FiMapPin size={16} />
              Entregar en: <strong>{datosCliente.direccion}, {datosCliente.ciudad}, {datosCliente.departamento}</strong>
            </p>

            {cotizandoEnvio && (
              <div className="heka-cargando">
                <div className="heka-spinner" />
                <span>Calculando opciones de envío para {datosCliente.ciudad}...</span>
              </div>
            )}

            {!cotizandoEnvio && errorEnvio && (
              <div className="heka-error">
                <FiAlertCircle size={20} />
                <div>
                  <p>No pudimos calcular el envío para tu ciudad. Verifica el nombre o contáctanos por WhatsApp.</p>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary heka-error-btn">
                    Contactar por WhatsApp
                  </a>
                </div>
              </div>
            )}

            {!cotizandoEnvio && !errorEnvio && cotizaciones.length > 0 && (
              <div className="envio-opciones">
                {cotizaciones.map((c) => (
                  <label
                    key={c.transportadora}
                    className={`envio-opcion ${transportadoraElegida?.transportadora === c.transportadora ? 'seleccionada' : ''}`}
                  >
                    <input
                      type="radio"
                      name="transportadora"
                      checked={transportadoraElegida?.transportadora === c.transportadora}
                      onChange={() => setTransportadoraElegida(c)}
                    />
                    {getLogoTransportadora(c.transportadora) && (
                      <img
                        src={getLogoTransportadora(c.transportadora)}
                        alt=""
                        className="envio-opcion-logo"
                        style={c.transportadora.toLowerCase() === 'servientrega' ? { width: 112, height: 112 } : undefined}
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    )}
                    <div>
                      <p className="envio-opcion-titulo">{c.transportadora}</p>
                      {c.tiempo && <p className="envio-opcion-detalle">Entrega estimada: {c.tiempo} días</p>}
                    </div>
                    <span className="envio-opcion-precio">{formatCOP(c.precio)}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="checkout-form-actions">
              <button className="btn btn-secondary" onClick={() => setPaso(1)}>Volver</button>
              <button
                className="btn btn-primary"
                onClick={handleSiguienteEnvio}
                disabled={!transportadoraElegida || cotizandoEnvio}
              >
                Continuar a pago
              </button>
            </div>
          </div>
        )}

        {/* ── Paso 3: Pago ── */}
        {paso === 3 && (
          <div className="checkout-form">
            <h2>Pago</h2>

            <div className="checkout-resumen">
              <div className="checkout-resumen-row">
                <span>Subtotal</span>
                <span>{formatCOP(subtotal)}</span>
              </div>
              <div className="checkout-resumen-row">
                <span>Envío · {transportadoraElegida?.transportadora}</span>
                <span>{formatCOP(costoEnvio)}</span>
              </div>
              <div className="checkout-resumen-row total">
                <span>Total</span>
                <span>{formatCOP(total)}</span>
              </div>
            </div>

            <p className="checkout-wompi-texto">
              Al continuar se abrirá el checkout seguro de <strong>Wompi</strong>, donde
              podrás elegir tarjeta de crédito/débito, PSE, Crédito Nequi o Bancolombia BNPL.
            </p>

            <div className="checkout-payment-badges">
              <span className="badge">Tarjeta crédito/débito</span>
              <span className="badge">PSE</span>
              <span className="badge">Crédito Nequi</span>
              <span className="badge">Bancolombia BNPL</span>
            </div>

            {error && <p className="checkout-error">{error}</p>}

            <div className="checkout-form-actions">
              <button className="btn btn-secondary" onClick={() => setPaso(2)} disabled={enviando}>Volver</button>
              <button className="btn btn-primary" onClick={handlePagar} disabled={enviando}>
                {enviando ? 'Procesando...' : `Pagar ${formatCOP(total)} con Wompi`}
              </button>
            </div>
          </div>
        )}

        {/* ── Sidebar ── */}
        <div className="checkout-summary-side">
          <h3>Tu pedido</h3>
          {items.map((item) => (
            <div key={item.cartItemId} className="checkout-summary-item">
              <span>
                {item.cantidad}x {item.nombre}
                {item.color && ` (${item.color})`}
              </span>
              <span>{formatCOP(item.precio * item.cantidad)}</span>
            </div>
          ))}
          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span>{formatCOP(subtotal)}</span>
          </div>
          <div className="checkout-summary-row">
            <span>Envío</span>
            <span className={envioSidebar.verde ? 'envio-gratis-label' : 'envio-pendiente-label'}>
              {envioSidebar.texto}
            </span>
          </div>
          <div className="checkout-summary-row total">
            <span>Total</span>
            <span>{formatCOP(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
