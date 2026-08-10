import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiCheck, FiMapPin, FiAlertCircle } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { crearPedido, getContraentregaConfig, calcularRecargoContraentrega } from '../lib/api'
import { supabase } from '../lib/supabaseClient'
import { formatCOP } from '../lib/format'
import './Checkout.css'

const PASOS = ['Datos', 'Envío', 'Pago']
const WHATSAPP_URL = 'https://wa.me/573046789119?text=Hola%2C%20necesito%20ayuda%20con%20el%20env%C3%ADo'

const LOGOS_TRANSPORTADORA = {
  interrapidisimo: 'https://qdclzxubnanrbyutcngc.supabase.co/storage/v1/object/public/assets/logo%20interrapidisimo.png',
  coordinadora:    'https://qdclzxubnanrbyutcngc.supabase.co/storage/v1/object/public/assets/logo%20coordinadora.avif',
  servientrega:    'https://qdclzxubnanrbyutcngc.supabase.co/storage/v1/object/public/assets/logo%20servientrega.webp',
  tcc:             'https://qdclzxubnanrbyutcngc.supabase.co/storage/v1/object/public/assets/Logo_TCC.svg.webp',
}

function getLogoTransportadora(nombre) {
  return LOGOS_TRANSPORTADORA[nombre?.toLowerCase()]
}

// ── Buscador de ciudad en tiempo real (Heka) ─────────────────────────────────
function CiudadBuscador({ value, onSelect }) {
  const [query, setQuery]           = useState(value ?? '')
  const [sugerencias, setSugerencias] = useState([])
  const [cargando, setCargando]     = useState(false)
  const [open, setOpen]             = useState(false)
  const ref     = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const buscar = (q) => {
    clearTimeout(timerRef.current)
    if (q.length < 2) { setSugerencias([]); setOpen(false); return }
    setCargando(true)
    timerRef.current = setTimeout(async () => {
      try {
        const { data } = await supabase.functions.invoke('heka-cotizar', {
          body: { accion: 'buscar', query: q },
        })
        setSugerencias(data?.ciudades ?? [])
        setOpen(true)
      } catch {
        setSugerencias([])
      } finally {
        setCargando(false)
      }
    }, 350)
  }

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q)
    onSelect(null)
    buscar(q)
  }

  const handleSelect = (ciudad) => {
    setQuery(ciudad.label)
    onSelect(ciudad)
    setOpen(false)
    setSugerencias([])
  }

  const sinResultados = open && !cargando && sugerencias.length === 0 && query.length >= 2

  return (
    <div className="combobox" ref={ref}>
      <input
        value={query}
        onChange={handleChange}
        placeholder={cargando ? 'Buscando...' : 'Escribe tu ciudad o municipio...'}
        autoComplete="off"
      />
      {open && sugerencias.length > 0 && (
        <ul className="combobox-list">
          {sugerencias.map((c) => (
            <li key={c.dane} onMouseDown={() => handleSelect(c)}>
              {c.label}
            </li>
          ))}
        </ul>
      )}
      {sinResultados && (
        <ul className="combobox-list">
          <li style={{ color: '#888', cursor: 'default' }}>No encontramos esa ciudad. Intenta con otro nombre.</li>
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
  const [ciudadValidada, setCiudadValidada] = useState(false)
  const [ciudadDane, setCiudadDane] = useState(null)

  // ── Estado envío Heka ─────────────────────────────────────────────
  const [cotizaciones, setCotizaciones] = useState([])
  const [cotizandoEnvio, setCotizandoEnvio] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState(null)
  const [transportadoraElegida, setTransportadoraElegida] = useState(null)

  // ── Contraentrega ─────────────────────────────────────────────────
  const [configContraentrega, setConfigContraentrega] = useState(null)
  const [metodoPago, setMetodoPago] = useState('wompi')

  // ── Estado pago ───────────────────────────────────────────────────
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getContraentregaConfig().then(setConfigContraentrega).catch(() => {})
  }, [])

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

  const soloAccesorios = items.length > 0 && items.every((i) => i.categoriaSlug === 'accesorios')
  const recargoContra = soloAccesorios && metodoPago === 'contraentrega'
    ? calcularRecargoContraentrega(subtotal, configContraentrega)
    : 0
  const costoEnvio = transportadoraElegida?.precio ?? 0
  const total = subtotal + costoEnvio + recargoContra

  const setCampo = (campo) => (valor) =>
    setDatosCliente((d) => ({ ...d, [campo]: valor }))

  const handleCampoInput = (campo) => (e) =>
    setDatosCliente((d) => ({ ...d, [campo]: e.target.value }))

  const handleCiudadHeka = (ciudad) => {
    if (!ciudad) {
      setCiudadValidada(false)
      setCiudadDane(null)
      setDatosCliente((d) => ({ ...d, ciudad: '', departamento: '' }))
    } else {
      setCiudadValidada(true)
      setCiudadDane(ciudad.dane)
      setDatosCliente((d) => ({ ...d, ciudad: ciudad.label, departamento: '' }))
    }
    setCotizaciones([])
    setTransportadoraElegida(null)
    setErrorEnvio(null)
  }

  const datosValidos =
    datosCliente.nombre.trim() &&
    datosCliente.telefono.trim() &&
    datosCliente.direccion.trim() &&
    ciudadValidada

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
        body: { city_dane: ciudadDane, declared_value: subtotal },
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

  const handleConfirmarContraentrega = async () => {
    setEnviando(true)
    setError(null)
    try {
      const pedido = await crearPedido({
        datosCliente,
        envio: { metodo: 'nacional' },
        items,
        subtotal,
        costoEnvio,
        transportadoraElegida: transportadoraElegida?.transportadora ?? null,
        ciudadDane,
        usuarioId: user?.id ?? null,
        metodoPago: 'contraentrega',
        recargoContraentrega: recargoContra,
        estadoPago: 'pendiente_contraentrega',
      })

      const lineas = items
        .map((i) => `  • ${i.nombre}${i.color ? ` (${i.color})` : ''} x${i.cantidad}`)
        .join('\n')
      const mensaje =
        `🛍️ Nuevo pedido MatCell — CONTRAENTREGA\n\n` +
        `📦 Pedido: ${pedido.numero_pedido}\n` +
        `👤 Cliente: ${datosCliente.nombre}\n` +
        `📱 Teléfono: ${datosCliente.telefono}\n` +
        `📍 Dirección: ${datosCliente.direccion}, ${datosCliente.ciudad}\n` +
        `🛒 Productos:\n${lineas}\n` +
        `💰 Total a recaudar: ${formatCOP(pedido.total)}\n` +
        `🚚 Transportadora: ${transportadoraElegida?.transportadora ?? 'Por definir'}\n\n` +
        `⚠️ Este pedido es CONTRAENTREGA — el cliente paga al recibir.`

      await supabase.functions.invoke('notificar-whatsapp', { body: { mensaje } })

      clearCart()
      navigate(`/pedido-confirmado?pedido=${pedido.numero_pedido}`, {
        state: { numeroPedido: pedido.numero_pedido, total: pedido.total, nombre: datosCliente.nombre },
      })
    } catch (err) {
      console.error(err)
      setError('No pudimos confirmar tu pedido. Intenta de nuevo en unos segundos.')
    } finally {
      setEnviando(false)
    }
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
        ciudadDane: ciudadDane ?? null,
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

            <label>
              Ciudad de entrega
              <CiudadBuscador
                value={datosCliente.ciudad}
                onSelect={handleCiudadHeka}
              />
            </label>

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

            {transportadoraElegida && (
              <div className="metodo-pago-wrap">
                <h3 className="metodo-pago-titulo">Método de pago</h3>
                <div className="metodo-pago-opciones">
                  <label className={`metodo-pago-opcion${metodoPago === 'wompi' ? ' seleccionado' : ''}`}>
                    <input
                      type="radio"
                      name="metodoPago"
                      checked={metodoPago === 'wompi'}
                      onChange={() => setMetodoPago('wompi')}
                    />
                    <div className="metodo-pago-info">
                      <p className="metodo-pago-nombre">Pagar ahora con Wompi</p>
                      <p className="metodo-pago-desc">Tarjeta, PSE, Nequi, Bancolombia. Seguro y rápido.</p>
                      {soloAccesorios && configContraentrega?.contraentrega_activa && (
                        <span className="metodo-pago-ahorro">
                          Ahorras {formatCOP(calcularRecargoContraentrega(subtotal, configContraentrega))}
                        </span>
                      )}
                    </div>
                    <span className="metodo-pago-precio">{formatCOP(subtotal + costoEnvio)}</span>
                  </label>

                  {soloAccesorios && configContraentrega?.contraentrega_activa && (
                    <label className={`metodo-pago-opcion${metodoPago === 'contraentrega' ? ' seleccionado' : ''}`}>
                      <input
                        type="radio"
                        name="metodoPago"
                        checked={metodoPago === 'contraentrega'}
                        onChange={() => setMetodoPago('contraentrega')}
                      />
                      <div className="metodo-pago-info">
                        <p className="metodo-pago-nombre">Pagar al recibir (Contraentrega)</p>
                        <p className="metodo-pago-desc">Pagas cuando llegue tu pedido a casa.</p>
                      </div>
                      <span className="metodo-pago-precio">
                        {formatCOP(subtotal + costoEnvio + calcularRecargoContraentrega(subtotal, configContraentrega))}
                      </span>
                    </label>
                  )}
                </div>
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
        {paso === 3 && metodoPago === 'wompi' && (
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

        {paso === 3 && metodoPago === 'contraentrega' && (
          <div className="checkout-form">
            <h2>Confirmar pedido</h2>

            <div className="checkout-resumen">
              <div className="checkout-resumen-row">
                <span>Subtotal</span>
                <span>{formatCOP(subtotal)}</span>
              </div>
              <div className="checkout-resumen-row">
                <span>Envío · {transportadoraElegida?.transportadora}</span>
                <span>{formatCOP(costoEnvio)}</span>
              </div>
              <div className="checkout-resumen-row">
                <span>Tarifa contraentrega</span>
                <span>{formatCOP(recargoContra)}</span>
              </div>
              <div className="checkout-resumen-row total">
                <span>Total a pagar al recibir</span>
                <span>{formatCOP(total)}</span>
              </div>
            </div>

            <div className="contraentrega-aviso">
              <p>Pagarás <strong>{formatCOP(total)}</strong> en efectivo directamente al mensajero cuando llegue tu pedido.</p>
            </div>

            {error && <p className="checkout-error">{error}</p>}

            <div className="checkout-form-actions">
              <button className="btn btn-secondary" onClick={() => setPaso(2)} disabled={enviando}>Volver</button>
              <button className="btn btn-primary btn-contraentrega" onClick={handleConfirmarContraentrega} disabled={enviando}>
                {enviando ? 'Confirmando...' : `Confirmar pedido · ${formatCOP(total)}`}
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
          {recargoContra > 0 && (
            <div className="checkout-summary-row">
              <span>Tarifa contraentrega</span>
              <span>{formatCOP(recargoContra)}</span>
            </div>
          )}
          <div className="checkout-summary-row total">
            <span>Total</span>
            <span>{formatCOP(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
