import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'
import {
  FiShield,
  FiTruck,
  FiGift,
  FiCreditCard,
  FiCheckCircle,
  FiShoppingCart,
  FiShare2,
  FiStar,
  FiCopy,
  FiX,
} from 'react-icons/fi'
import {
  getProductoById,
  getEnvioNacional,
  getAccesoriosSugeridos,
  getResenasProducto,
  getBundleProducto,
  getCategoriaBundle,
} from '../lib/api'
import { formatCOP } from '../lib/format'
import { useCart } from '../context/CartContext'
import Breadcrumbs from '../components/catalogo/Breadcrumbs'
import ProductGallery from '../components/producto/ProductGallery'
import DeliveryEstimate from '../components/producto/DeliveryEstimate'
import AsesorModal from '../components/producto/AsesorModal'
import AccessorySuggestions from '../components/producto/AccessorySuggestions'
import ProductReviews from '../components/producto/ProductReviews'
import StickyBuyBar from '../components/producto/StickyBuyBar'
import WishlistHeart from '../components/producto/WishlistHeart'
import ReviewForm from '../components/resenas/ReviewForm'
import { useTiendaConfig } from '../context/TiendaConfigContext'
import './ProductoDetalle.css'

const STOCK_BAJO_UMBRAL = 3

const SPECS_LABELS = [
  ['almacenamiento', 'Almacenamiento'],
  ['pantalla', 'Pantalla'],
  ['procesador', 'Procesador'],
  ['camara', 'Cámara'],
  ['material', 'Material'],
]

export default function ProductoDetalle() {
  const { id } = useParams()
  const { addItem, addItemSilent, addItemBundle } = useCart()
  const { whatsapp } = useTiendaConfig()
  const navigate = useNavigate()

  const [producto, setProducto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [capacidadSeleccionada, setCapacidadSeleccionada] = useState(null)
  const [compatibilidadSeleccionada, setCompatibilidadSeleccionada] = useState(null)
  const [colorSeleccionado, setColorSeleccionado] = useState(null)
  const [envio, setEnvio] = useState(null)
  const [accesorios, setAccesorios] = useState([])
  const [reviewsData, setReviewsData] = useState({ resenas: [], esEspecifica: false })
  const [asesorModalOpen, setAsesorModalOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [bundle, setBundle] = useState(null)
  const [categoriaBundle, setCategoriaBundle] = useState(null)
  const [bundleOpcion, setBundleOpcion] = useState(1)
  const [bundleExtraVariante, setBundleExtraVariante] = useState(null)
  const ctasRef = useRef(null)

  useEffect(() => {
    setCargando(true)
    setProducto(null)

    getProductoById(id)
      .then((data) => {
        setProducto(data)

        const variantes = data?.producto_variantes ?? []
        const esAccesorioInit = data?.categorias?.slug === 'accesorios'
        if (variantes.length > 0) {
          if (esAccesorioInit) {
            const compats = [...new Set(variantes.map((v) => v.modelo_compatible).filter(Boolean))]
            const compatInicial = compats[0] ?? null
            setCompatibilidadSeleccionada(compatInicial)
            const coloresInicial = compatInicial
              ? variantes.filter((v) => v.modelo_compatible === compatInicial)
              : variantes
            setColorSeleccionado(coloresInicial[0]?.color ?? null)
          } else {
            const capacidades = [...new Set(variantes.map((v) => v.almacenamiento).filter(Boolean))]
            const capacidadInicial = capacidades.length > 1 ? capacidades[0] : null
            setCapacidadSeleccionada(capacidadInicial)
            const coloresInicial = capacidadInicial
              ? variantes.filter((v) => v.almacenamiento === capacidadInicial)
              : variantes
            setColorSeleccionado(coloresInicial[0]?.color ?? null)
          }
        }

        if (data) {
          getAccesoriosSugeridos(data.id).then(setAccesorios).catch(console.error)
          getResenasProducto(data.id).then(setReviewsData).catch(console.error)
          if (data.categorias?.slug === 'accesorios') {
            getBundleProducto(data.id).then(setBundle).catch(console.error)
            getCategoriaBundle(data.categoria_id).then(setCategoriaBundle).catch(console.error)
          }
        }
      })
      .catch(console.error)
      .finally(() => setCargando(false))

    getEnvioNacional().then(setEnvio).catch(console.error)
  }, [id])

  if (cargando) {
    return <div className="producto-detalle-vacio" />
  }

  if (!producto) {
    return (
      <div className="producto-detalle-vacio">
        <h1>Producto no encontrado</h1>
        <p>Este producto no existe o ya no está disponible.</p>
        <Link to="/" className="btn btn-primary">
          Volver al inicio
        </Link>
      </div>
    )
  }

  const variantes = producto.producto_variantes ?? []
  const esAccesorio = producto.categorias?.slug === 'accesorios'

  const compatibilidades = esAccesorio
    ? [...new Set(variantes.map((v) => v.modelo_compatible).filter(Boolean))]
    : []
  const tieneCompatibilidades = compatibilidades.length > 1

  const capacidades = !esAccesorio
    ? [...new Set(variantes.map((v) => v.almacenamiento).filter(Boolean))]
    : []
  const tieneCapacidades = capacidades.length > 1

  const coloresDisponibles = esAccesorio
    ? (compatibilidadSeleccionada
        ? variantes.filter((v) => v.modelo_compatible === compatibilidadSeleccionada)
        : variantes)
    : (tieneCapacidades
        ? variantes.filter((v) => v.almacenamiento === capacidadSeleccionada)
        : variantes)

  const varianteActiva = variantes.find((v) => {
    if (esAccesorio) {
      return (!compatibilidadSeleccionada || v.modelo_compatible === compatibilidadSeleccionada)
        && v.color === colorSeleccionado
    }
    return (!tieneCapacidades || v.almacenamiento === capacidadSeleccionada)
      && v.color === colorSeleccionado
  })

  const stockMostrado = varianteActiva ? varianteActiva.stock : producto.stock
  const precioMostrado = varianteActiva?.precio ?? producto.precio
  const stockBajo = stockMostrado > 0 && stockMostrado <= STOCK_BAJO_UMBRAL
  const agotado = stockMostrado === 0 && variantes.length > 0

  const fotosColor = (producto.fotos ?? []).filter((f) => f.color === colorSeleccionado)
  const fotosGaleria =
    fotosColor.length > 0 ? fotosColor : (producto.fotos ?? []).filter((f) => !f.color)

  const specsDisponibles = SPECS_LABELS.filter(
    ([key]) => producto[key] && !(key === 'almacenamiento' && (tieneCapacidades || esAccesorio))
  )

  const mensajeSimple = `Hola, tengo dudas sobre el ${producto.nombre}. ¿Me pueden ayudar?`
  const whatsappSimpleHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensajeSimple)}`

  const promedio = reviewsData.resenas.length > 0
    ? reviewsData.resenas.reduce((s, r) => s + r.calificacion, 0) / reviewsData.resenas.length
    : 0

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: producto.nombre, url }) } catch (_) {}
      return
    }
    setShareOpen((o) => !o)
  }

  const handleCopiarLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiado(true)
    setShareOpen(false)
    setTimeout(() => setCopiado(false), 2000)
  }

  const waShareHref = `https://wa.me/?text=${encodeURIComponent(`Mira este producto en MatCell: ${window.location.href}`)}`

  const handleSeleccionarCapacidad = (capacidad) => {
    setCapacidadSeleccionada(capacidad)
    const colores = variantes.filter((v) => v.almacenamiento === capacidad)
    setColorSeleccionado(colores[0]?.color ?? null)
  }

  const handleSeleccionarCompatibilidad = (compat) => {
    setCompatibilidadSeleccionada(compat)
    const colores = variantes.filter((v) => v.modelo_compatible === compat)
    setColorSeleccionado(colores[0]?.color ?? null)
  }

  const varianteLabel = esAccesorio
    ? [compatibilidadSeleccionada ? `Compatible con ${compatibilidadSeleccionada}` : null, colorSeleccionado].filter(Boolean).join(' · ')
    : [capacidadSeleccionada, colorSeleccionado].filter(Boolean).join(' - ')

  const itemParaCarrito = {
    productoId: producto.id,
    nombre: producto.nombre,
    foto: fotosGaleria?.[0]?.url ?? producto.fotos?.[0]?.url ?? null,
    precio: precioMostrado,
    color: varianteLabel || null,
    stockDisponible: null,
    categoriaId: producto.categoria_id,
    categoriaSlug: producto.categorias?.slug,
  }

  const calcularBundleOpcion = (cantidad, tipo, descuento) => {
    const descPorUnidad = tipo === 'porcentaje'
      ? Math.round(precioMostrado * Number(descuento) / 100)
      : Number(descuento)
    const precioUnitario = Math.max(0, precioMostrado - descPorUnidad)
    const totalBase = precioMostrado * cantidad
    const totalConDesc = precioUnitario * cantidad
    return { totalBase, totalConDesc, ahorro: totalBase - totalConDesc, precioUnitario }
  }

  const handleAgregarBundle = (cantidad, tipo, descuento, descripcion) => {
    if (agotado) return
    const { precioUnitario } = calcularBundleOpcion(cantidad, tipo, descuento)
    addItemBundle(itemParaCarrito, cantidad, precioUnitario, descripcion)
  }

  const handleAgregarAlCarrito = () => {
    if (agotado) return
    addItem(itemParaCarrito)
  }

  const handleComprarAhora = () => {
    if (agotado) return
    addItemSilent(itemParaCarrito)
    navigate('/checkout')
  }

  const categoria = producto.categorias
  const faqTitulo =
    producto.estado === 'seminuevo'
      ? '¿Qué es un equipo seminuevo en MatCell?'
      : '¿Qué es un equipo nuevo en MatCell?'
  const faqRespuesta =
    producto.estado === 'seminuevo'
      ? 'Es un equipo usado que pasó por nuestro proceso de certificación: revisión técnica completa, reparación con piezas originales o certificadas si fue necesario, y garantía real desde el día de la compra.'
      : 'Es un equipo nuevo, sellado de fábrica, con garantía directa y todos sus accesorios originales incluidos.'

  return (
    <div className="producto-detalle">
      <Breadcrumbs
        items={[
          ...(categoria
            ? [{ label: categoria.nombre, to: `/catalogo/${categoria.slug}` }]
            : []),
          { label: producto.nombre },
        ]}
      />

      <div className="producto-detalle-body">
        <ProductGallery
          key={colorSeleccionado}
          fotos={fotosGaleria}
          nombre={producto.nombre}
        />

        <div className="producto-info">
          <div className="producto-info-top">
            <span className="producto-condition">
              {producto.estado === 'seminuevo' ? 'Seminuevo' : 'Nuevo'}
            </span>
            <WishlistHeart productoId={producto.id} />
          </div>

          <div className="producto-title-row">
            <h1>{producto.nombre}</h1>
            <div className="producto-share-wrap">
              <button className="producto-share-btn" onClick={handleShare} aria-label="Compartir">
                <FiShare2 size={18} />
              </button>
              {shareOpen && (
                <div className="producto-share-menu">
                  <a href={waShareHref} target="_blank" rel="noopener noreferrer" className="share-option">
                    <FaWhatsapp size={16} /> WhatsApp
                  </a>
                  <button className="share-option" onClick={handleCopiarLink}>
                    <FiCopy size={16} /> Copiar link
                  </button>
                </div>
              )}
              {copiado && <span className="share-copiado">¡Link copiado!</span>}
            </div>
          </div>

          {promedio > 0 && (
            <button
              className="producto-rating-row"
              onClick={() => document.querySelector('.product-reviews')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar key={i} size={14} fill={i < Math.round(promedio) ? 'currentColor' : 'none'} />
              ))}
              <span className="rating-num">{promedio.toFixed(1)}</span>
              <span className="rating-count">({reviewsData.resenas.length} reseñas)</span>
            </button>
          )}

          <div className="producto-price">
            <span className="price-current">{formatCOP(precioMostrado)}</span>
            {producto.en_oferta && producto.precio_anterior && (
              <span className="price-old">{formatCOP(producto.precio_anterior)}</span>
            )}
          </div>

          {agotado && <p className="producto-agotado">Agotado en este color</p>}
          {!agotado && stockBajo && (
            <p className="producto-stock-bajo">Quedan {stockMostrado} unidades</p>
          )}

          {producto.incluye_regalo && (
            <p className="producto-regalo">
              <FiGift size={16} />
              Incluye de regalo:{' '}
              {producto.estado === 'seminuevo'
                ? 'Vidrio templado + Forro de silicona + Cable de carga'
                : 'Vidrio templado + Forro de silicona'}
            </p>
          )}

          {esAccesorio && tieneCompatibilidades && (
            <div className="producto-variantes">
              <p className="variantes-label">Compatible con</p>
              <div className="variantes-options">
                {compatibilidades.map((compat) => (
                  <button
                    key={compat}
                    className={`variante-chip ${compat === compatibilidadSeleccionada ? 'active' : ''}`}
                    onClick={() => handleSeleccionarCompatibilidad(compat)}
                  >
                    {compat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!esAccesorio && tieneCapacidades && (
            <div className="producto-variantes">
              <p className="variantes-label">Capacidad</p>
              <div className="variantes-options">
                {capacidades.map((capacidad) => (
                  <button
                    key={capacidad}
                    className={`variante-chip ${
                      capacidad === capacidadSeleccionada ? 'active' : ''
                    }`}
                    onClick={() => handleSeleccionarCapacidad(capacidad)}
                  >
                    {capacidad}
                  </button>
                ))}
              </div>
            </div>
          )}

          {coloresDisponibles.length > 0 && (
            <div className="producto-variantes">
              <p className="variantes-label">
                Color
                {varianteActiva?.color && <span> · {varianteActiva.color}</span>}
                {varianteActiva?.modelo_compatible && (
                  <span> · {varianteActiva.modelo_compatible}</span>
                )}
              </p>
              <div className="variantes-options-color">
                {coloresDisponibles.map((variante) => (
                  <button
                    key={variante.id}
                    className={`color-swatch ${
                      variante.color === colorSeleccionado ? 'active' : ''
                    } ${variante.stock === 0 ? 'sin-stock' : ''}`}
                    style={{ backgroundColor: variante.color_hex || '#ccc' }}
                    onClick={() => setColorSeleccionado(variante.color)}
                    aria-label={
                      variante.stock === 0
                        ? `${variante.color} (agotado)`
                        : variante.color
                    }
                    title={variante.color}
                  />
                ))}
              </div>
            </div>
          )}

          <DeliveryEstimate envio={envio} />

          {producto.descripcion && (
            <p className="producto-descripcion">{producto.descripcion}</p>
          )}

          {producto.caracteristicas?.length > 0 && (
            <ul className="producto-caracteristicas">
              {producto.caracteristicas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}

          {specsDisponibles.length > 0 && (
            <table className="producto-specs">
              <tbody>
                {specsDisponibles.map(([key, label]) => (
                  <tr key={key}>
                    <th>{label}</th>
                    <td>{producto[key]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!esAccesorio && (
            <div className="producto-faq">
              <p className="producto-faq-pregunta">{faqTitulo}</p>
              <p className="producto-faq-respuesta">{faqRespuesta}</p>
            </div>
          )}

          <div className="producto-ctas" ref={ctasRef}>
            <button
              className="btn btn-primary producto-cta"
              onClick={handleAgregarAlCarrito}
              disabled={agotado}
            >
              <FiShoppingCart size={18} />
              {agotado ? 'Agotado' : 'Agregar al carrito'}
            </button>

            {esAccesorio && bundle && (bundle.bundle_2_activo || bundle.bundle_3_activo) && !agotado && (
              <div className="producto-bundle-section">
                <div className="bundle-divider">
                  <div className="bundle-divider-line" />
                  <span>El segundo al mejor precio</span>
                  <div className="bundle-divider-line" />
                </div>

                <div className="bundle-opciones">
                  {/* Opción 1 — normal */}
                  <button
                    className={`bundle-opcion ${bundleOpcion === 1 ? 'active' : ''}`}
                    onClick={() => { setBundleOpcion(1); setBundleExtraVariante(null) }}
                  >
                    <span className="bundle-radio" />
                    <span className="bundle-opcion-titulo">1 unidad</span>
                    <span className="bundle-opcion-precio-normal">{formatCOP(precioMostrado)}</span>
                  </button>

                  {/* Opción 2 */}
                  {bundle.bundle_2_activo && (() => {
                    const esMisma = !bundleExtraVariante || bundleExtraVariante.id === (varianteActiva?.id ?? null)
                    const tipo = esMisma ? bundle.bundle_2_tipo : 'valor'
                    const descuento = esMisma ? bundle.bundle_2_descuento : (categoriaBundle?.bundle_descuento_x2 ?? 0)
                    const b = calcularBundleOpcion(2, tipo, descuento)
                    return (
                      <div key="b2" className="bundle-opcion-group">
                        <button
                          className={`bundle-opcion ${bundleOpcion === 2 ? 'active' : ''}`}
                          onClick={() => setBundleOpcion(2)}
                        >
                          <span className="bundle-radio" />
                          <div className="bundle-opcion-body">
                            <span className="bundle-opcion-titulo">2 unidades</span>
                            <div className="bundle-opcion-precios">
                              <s>{formatCOP(b.totalBase)}</s>
                              {' '}<strong>{formatCOP(b.totalConDesc)}</strong>
                            </div>
                          </div>
                          <span className="bundle-ahorro-badge">Ahorras {formatCOP(b.ahorro)}</span>
                        </button>

                        {bundleOpcion === 2 && (
                          <div className="bundle-expandido">
                            <p className="bundle-cada-uno">Cada uno a {formatCOP(b.precioUnitario)}</p>
                            {variantes.length > 1 && (
                              <div className="bundle-variante-wrap">
                                <p className="bundle-variante-label">Segunda unidad:</p>
                                <div className="bundle-variante-chips">
                                  {variantes.map((v) => {
                                    const lbl = [v.modelo_compatible, v.color].filter(Boolean).join(' · ') || 'Estándar'
                                    const isSel = bundleExtraVariante ? bundleExtraVariante.id === v.id : v.id === varianteActiva?.id
                                    return (
                                      <button
                                        key={v.id}
                                        className={`bundle-var-chip ${isSel ? 'active' : ''}`}
                                        onClick={() => setBundleExtraVariante(v.id === varianteActiva?.id ? null : v)}
                                      >
                                        {lbl}
                                      </button>
                                    )
                                  })}
                                </div>
                                {!esMisma && categoriaBundle && b.ahorro > 0 && (
                                  <p className="bundle-mixto-nota">Descuento aplicado por llevar 2 accesorios</p>
                                )}
                              </div>
                            )}
                            <button
                              className="bundle-cta-btn"
                              onClick={() => handleAgregarBundle(2, tipo, descuento, `Bundle x2${!esMisma ? ' mixto' : ''} – Ahorras ${formatCOP(b.ahorro)}`)}
                            >
                              Agregar 2 al carrito →
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Opción 3 */}
                  {bundle.bundle_3_activo && (() => {
                    const b = calcularBundleOpcion(3, bundle.bundle_3_tipo, bundle.bundle_3_descuento)
                    return (
                      <div key="b3" className="bundle-opcion-group">
                        <button
                          className={`bundle-opcion ${bundleOpcion === 3 ? 'active' : ''}`}
                          onClick={() => setBundleOpcion(3)}
                        >
                          <span className="bundle-radio" />
                          <div className="bundle-opcion-body">
                            <span className="bundle-opcion-titulo">3 unidades</span>
                            <div className="bundle-opcion-precios">
                              <s>{formatCOP(b.totalBase)}</s>
                              {' '}<strong>{formatCOP(b.totalConDesc)}</strong>
                            </div>
                          </div>
                          <span className="bundle-ahorro-badge">Ahorras {formatCOP(b.ahorro)}</span>
                        </button>

                        {bundleOpcion === 3 && (
                          <div className="bundle-expandido">
                            <p className="bundle-cada-uno">Cada uno a {formatCOP(b.precioUnitario)}</p>
                            <button
                              className="bundle-cta-btn"
                              onClick={() => handleAgregarBundle(3, bundle.bundle_3_tipo, bundle.bundle_3_descuento, `Bundle x3 – Ahorras ${formatCOP(b.ahorro)}`)}
                            >
                              Agregar 3 al carrito →
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            <button
              className="btn producto-cta producto-cta-comprar"
              onClick={handleComprarAhora}
              disabled={agotado}
            >
              Comprar ahora
            </button>

            <a
              href={whatsappSimpleHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary producto-cta-simple"
            >
              <FaWhatsapp size={18} />
              {esAccesorio ? '¿Tienes dudas sobre este producto? Escríbenos' : '¿Dudas sobre este equipo? Escríbenos'}
            </a>

            <button
              className="btn btn-secondary producto-cta-simple"
              onClick={() => setAsesorModalOpen(true)}
            >
              Finalizar compra con un asesor
            </button>
          </div>

          {/* Métodos de pago */}
          <div className="producto-metodos-pago">
            <span className="pago-label"><FiShield size={13} /> Pago 100% seguro con</span>
            <div className="pago-logos">
              <span className="pago-logo pago-visa">VISA</span>
              <span className="pago-logo pago-mc">
                <span className="mc-circle mc-red" />
                <span className="mc-circle mc-orange" />
              </span>
              <span className="pago-logo pago-pse">PSE</span>
              <span className="pago-logo pago-nequi">nequi</span>
              <span className="pago-logo pago-bcol">Bancolombia</span>
            </div>
          </div>

          <div className="producto-pago-seguro">
            <FiShield size={18} />
            <p>
              Todos los pagos se procesan de forma 100% segura y verificada a
              través de Wompi (tarjeta, PSE, Crédito Nequi o Bancolombia BNPL).
              Nunca compartimos tus datos financieros, y solo usamos canales
              oficiales de pago.
            </p>
          </div>

          <div className="producto-trust-badges">
            <div className="trust-badge">
              <FiCreditCard size={18} />
              <span>Pago 100% seguro</span>
            </div>
            <div className="trust-badge">
              <FiCheckCircle size={18} />
              <span>Equipo certificado</span>
            </div>
            <div className="trust-badge">
              <FiTruck size={18} />
              <span>Envío a todo el país</span>
            </div>
          </div>
        </div>
      </div>

      <AccessorySuggestions productos={accesorios} esAccesorio={esAccesorio} />
      <ProductReviews resenas={reviewsData.resenas} esEspecifica={reviewsData.esEspecifica} />

      <section className="producto-review-form">
        <h2>Cuéntanos tu experiencia</h2>
        <ReviewForm productoId={producto.id} />
      </section>

      <StickyBuyBar
        producto={producto}
        precio={precioMostrado}
        agotado={agotado}
        onAddToCart={handleAgregarAlCarrito}
        onBuyNow={handleComprarAhora}
        ctaRef={ctasRef}
      />

      {asesorModalOpen && (
        <AsesorModal
          producto={producto}
          precio={precioMostrado}
          envio={envio}
          onClose={() => setAsesorModalOpen(false)}
        />
      )}
    </div>
  )
}
