import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiCheck, FiMapPin, FiInfo } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getEnvioNacional, getRecogidaLocal, crearPedido } from '../lib/api'
import { supabase } from '../lib/supabaseClient'
import { formatCOP, formatFechaCorta, sumarDias } from '../lib/format'
import { DEPARTAMENTOS, MUNICIPIOS } from '../lib/municipios'
import './Checkout.css'

const PASOS = ['Datos', 'Envío', 'Pago']

// ── Normalización ────────────────────────────────────────────────────────────
const ACENTOS = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ñ: 'n', ü: 'u' }
function normalizar(texto) {
  return (texto ?? '')
    .trim()
    .toLowerCase()
    .split('')
    .map((char) => ACENTOS[char] ?? char)
    .join('')
}

// ── Tarifas de envío ─────────────────────────────────────────────────────────
const TARIFAS_ENVIO = {
  local: {
    ciudades: ['cienaga'],
    precio: 0,
    label: 'Recogida en local',
  },
  caribe: {
    ciudades: ['santa marta', 'barranquilla', 'cartagena'],
    precio: 12000,
    label: 'Envío nacional',
  },
  nacional: {
    ciudades: [
      'bogota', 'bogota d.c.', 'medellin', 'cali', 'bucaramanga',
      'monteria', 'sincelejo', 'riohacha', 'maicao', 'cucuta',
      'pereira', 'manizales', 'armenia', 'ibague', 'neiva',
      'villavicencio', 'valledupar', 'pasto', 'popayan', 'tunja',
      'mocoa', 'yopal', 'soledad', 'itagui', 'bello', 'envigado',
      'palmira', 'tulua', 'buga', 'cartago',
    ],
    precio: 19000,
    label: 'Envío nacional',
  },
  alejadas: {
    ciudades: [
      'quibdo', 'florencia', 'arauca', 'mitu', 'san jose del guaviare',
      'inirida', 'puerto carreno', 'leticia', 'san andres',
    ],
    precio: 22000,
    label: 'Envío nacional',
  },
}

function calcularEnvio(ciudad) {
  if (!ciudad || ciudad.trim() === '') return null
  const norm = normalizar(ciudad)
  for (const zona of Object.values(TARIFAS_ENVIO)) {
    if (zona.ciudades.map(normalizar).includes(norm)) return zona.precio
  }
  return 22000
}

// ── Combobox con búsqueda ─────────────────────────────────────────────────────
function Combobox({ value, onChange, opciones, placeholder, disabled }) {
  const [query, setQuery] = useState(value ?? '')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Sincronizar cuando el valor externo cambia (ej: reset de ciudad al cambiar depto)
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
  const [metodoEnvio, setMetodoEnvio] = useState(null)
  const [envioNacional, setEnvioNacional] = useState(null)
  const [recogidaLocal, setRecogidaLocal] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getEnvioNacional().then(setEnvioNacional).catch(console.error)
    getRecogidaLocal().then(setRecogidaLocal).catch(console.error)
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

  // ── Cálculo de envío ──────────────────────────────────────────────────────
  const costoCalculado = calcularEnvio(datosCliente.ciudad)
  const esCienaga = costoCalculado === 0
  const envioGratisPorMonto = subtotal >= (envioNacional?.gratis_desde_monto ?? Infinity)
  const costoEnvioNacional = envioGratisPorMonto ? 0 : (costoCalculado ?? envioNacional?.costo ?? 0)
  const costoEnvio = metodoEnvio === 'recogida_local' ? 0 : costoEnvioNacional
  const total = subtotal + costoEnvio

  const setCampo = (campo) => (valor) =>
    setDatosCliente((d) => ({ ...d, [campo]: valor }))

  const handleCampoInput = (campo) => (e) =>
    setDatosCliente((d) => ({ ...d, [campo]: e.target.value }))

  const handleDepartamento = (depto) => {
    setDatosCliente((d) => ({ ...d, departamento: depto, ciudad: '' }))
  }

  const datosValidos =
    datosCliente.nombre.trim() &&
    datosCliente.telefono.trim() &&
    datosCliente.direccion.trim() &&
    datosCliente.departamento.trim() &&
    datosCliente.ciudad.trim()

  const handleSiguienteDatos = (e) => {
    e.preventDefault()
    if (!datosValidos) return
    if (esCienaga) setMetodoEnvio('recogida_local')
    setPaso(2)
  }

  const handleSiguienteEnvio = () => {
    if (!metodoEnvio) return
    setPaso(3)
  }

  const handlePagar = async () => {
    setEnviando(true)
    setError(null)

    let pedido
    try {
      pedido = await crearPedido({
        datosCliente,
        envio: { metodo: metodoEnvio },
        items,
        subtotal,
        costoEnvio,
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
          setError(
            'El pago no se completó. Puedes intentar de nuevo o contactarnos si el dinero fue descontado.'
          )
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

  const hoy = new Date()

  // Texto del envío para el sidebar
  const envioSidebarLabel = () => {
    if (!datosCliente.ciudad.trim()) return { texto: 'Se calcula al ingresar tu ciudad', verde: false }
    if (envioGratisPorMonto) return { texto: 'Gratis', verde: true }
    if (esCienaga) return { texto: 'Recogida en local · Gratis', verde: true }
    return { texto: formatCOP(costoCalculado ?? envioNacional?.costo ?? 0), verde: false }
  }
  const sidebarEnvio = envioSidebarLabel()

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
                  onChange={setCampo('ciudad')}
                  opciones={municipiosDepartamento}
                  placeholder={datosCliente.departamento ? 'Busca tu municipio...' : 'Selecciona primero un departamento'}
                  disabled={!datosCliente.departamento}
                />
              </label>
            </div>

            <p className="checkout-ciudad-nota">
              <FiInfo size={13} />
              ¿No encuentras tu municipio? Escríbelo manualmente o agrégalo en el campo de referencia. También puedes contactarnos por WhatsApp.
            </p>

            <button type="submit" className="btn btn-primary" disabled={!datosValidos}>
              Continuar a envío
            </button>
          </form>
        )}

        {/* ── Paso 2: Envío ── */}
        {paso === 2 && (
          <div className="checkout-form">
            <h2>Método de envío</h2>
            <p className="checkout-direccion">
              <FiMapPin size={16} />
              Entregar en: <strong>{datosCliente.direccion}, {datosCliente.ciudad}, {datosCliente.departamento}</strong>
            </p>

            <div className="envio-opciones">
              <label className={`envio-opcion ${!esCienaga ? 'disabled' : ''}`}>
                <input
                  type="radio"
                  name="envio"
                  disabled={!esCienaga}
                  checked={metodoEnvio === 'recogida_local'}
                  onChange={() => setMetodoEnvio('recogida_local')}
                />
                <div>
                  <p className="envio-opcion-titulo">Recogida en el local (Ciénaga)</p>
                  <p className="envio-opcion-detalle">
                    {esCienaga
                      ? 'Gratis · Disponible para tu ciudad'
                      : 'Solo disponible si la ciudad de entrega es Ciénaga'}
                  </p>
                </div>
                <span className="envio-opcion-precio">Gratis</span>
              </label>

              <label className="envio-opcion">
                <input
                  type="radio"
                  name="envio"
                  checked={metodoEnvio === 'nacional'}
                  onChange={() => setMetodoEnvio('nacional')}
                />
                <div>
                  <p className="envio-opcion-titulo">Envío nacional</p>
                  <p className="envio-opcion-detalle">
                    Incluye Santa Marta y el resto del país
                    {envioNacional?.dias_min && (
                      <>
                        {' '}· Llega entre el {formatFechaCorta(sumarDias(hoy, envioNacional.dias_min))} y
                        el {formatFechaCorta(sumarDias(hoy, envioNacional.dias_max))}
                      </>
                    )}
                  </p>
                </div>
                <span className="envio-opcion-precio">
                  {envioGratisPorMonto ? 'Gratis' : formatCOP(costoCalculado ?? envioNacional?.costo ?? 0)}
                </span>
              </label>
            </div>

            <div className="checkout-form-actions">
              <button className="btn btn-secondary" onClick={() => setPaso(1)}>Volver</button>
              <button className="btn btn-primary" onClick={handleSiguienteEnvio} disabled={!metodoEnvio}>
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
                <span>Envío</span>
                <span>{costoEnvio === 0 ? 'Gratis' : formatCOP(costoEnvio)}</span>
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

        {/* ── Sidebar resumen ── */}
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
            <span className={sidebarEnvio.verde ? 'envio-gratis-label' : 'envio-pendiente-label'}>
              {sidebarEnvio.texto}
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
