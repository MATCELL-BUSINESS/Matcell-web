import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'
import {
  FiShield,
  FiTruck,
  FiGift,
  FiCreditCard,
  FiCheckCircle,
  FiShoppingCart,
} from 'react-icons/fi'
import {
  getProductoById,
  getEnvioNacional,
  getAccesoriosSugeridos,
  getResenasProducto,
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
  const { addItem } = useCart()
  const { whatsapp } = useTiendaConfig()

  const [producto, setProducto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [capacidadSeleccionada, setCapacidadSeleccionada] = useState(null)
  const [colorSeleccionado, setColorSeleccionado] = useState(null)
  const [envio, setEnvio] = useState(null)
  const [accesorios, setAccesorios] = useState([])
  const [reviewsData, setReviewsData] = useState({ resenas: [], esEspecifica: false })
  const [asesorModalOpen, setAsesorModalOpen] = useState(false)

  useEffect(() => {
    setCargando(true)
    setProducto(null)

    getProductoById(id)
      .then((data) => {
        setProducto(data)

        const variantes = data?.producto_variantes ?? []
        if (variantes.length > 0) {
          const capacidades = [
            ...new Set(variantes.map((v) => v.almacenamiento).filter(Boolean)),
          ]
          const capacidadInicial = capacidades.length > 1 ? capacidades[0] : null
          setCapacidadSeleccionada(capacidadInicial)

          const coloresInicial = capacidadInicial
            ? variantes.filter((v) => v.almacenamiento === capacidadInicial)
            : variantes
          setColorSeleccionado(coloresInicial[0]?.color ?? null)
        }

        if (data) {
          getAccesoriosSugeridos(data.id).then(setAccesorios).catch(console.error)
          getResenasProducto(data.id).then(setReviewsData).catch(console.error)
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
  const capacidades = [...new Set(variantes.map((v) => v.almacenamiento).filter(Boolean))]
  const tieneCapacidades = capacidades.length > 1
  const coloresDisponibles = tieneCapacidades
    ? variantes.filter((v) => v.almacenamiento === capacidadSeleccionada)
    : variantes
  const varianteActiva = variantes.find(
    (v) =>
      (!tieneCapacidades || v.almacenamiento === capacidadSeleccionada) &&
      v.color === colorSeleccionado
  )
  const stockMostrado = varianteActiva ? varianteActiva.stock : producto.stock
  const precioMostrado = varianteActiva?.precio ?? producto.precio
  const stockBajo = stockMostrado > 0 && stockMostrado <= STOCK_BAJO_UMBRAL
  const agotado = stockMostrado === 0 && variantes.length > 0

  const fotosColor = (producto.fotos ?? []).filter((f) => f.color === colorSeleccionado)
  const fotosGaleria =
    fotosColor.length > 0 ? fotosColor : (producto.fotos ?? []).filter((f) => !f.color)

  const specsDisponibles = SPECS_LABELS.filter(
    ([key]) => producto[key] && !(key === 'almacenamiento' && tieneCapacidades)
  )

  const mensajeSimple = `Hola, tengo dudas sobre el ${producto.nombre}. ¿Me pueden ayudar?`
  const whatsappSimpleHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensajeSimple)}`

  const handleSeleccionarCapacidad = (capacidad) => {
    setCapacidadSeleccionada(capacidad)
    const colores = variantes.filter((v) => v.almacenamiento === capacidad)
    setColorSeleccionado(colores[0]?.color ?? null)
  }

  const varianteLabel = [capacidadSeleccionada, colorSeleccionado].filter(Boolean).join(' - ')

  const handleAgregarAlCarrito = () => {
    if (agotado) return
    addItem({
      productoId: producto.id,
      nombre: producto.nombre,
      foto: fotosGaleria?.[0]?.url ?? producto.fotos?.[0]?.url ?? null,
      precio: precioMostrado,
      color: varianteLabel || null,
      stockDisponible: stockMostrado,
    })
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

          <h1>{producto.nombre}</h1>

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

          {tieneCapacidades && (
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

          <div className="producto-faq">
            <p className="producto-faq-pregunta">{faqTitulo}</p>
            <p className="producto-faq-respuesta">{faqRespuesta}</p>
          </div>

          <div className="producto-ctas">
            <button
              className="btn btn-primary producto-cta"
              onClick={handleAgregarAlCarrito}
              disabled={agotado}
            >
              <FiShoppingCart size={18} />
              {agotado ? 'Agotado' : 'Agregar al carrito'}
            </button>

            <a
              href={whatsappSimpleHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary producto-cta-simple"
            >
              <FaWhatsapp size={18} />
              ¿Dudas sobre este equipo? Escríbenos
            </a>

            <button
              className="btn btn-secondary producto-cta-simple"
              onClick={() => setAsesorModalOpen(true)}
            >
              Finalizar compra con un asesor
            </button>
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

      <AccessorySuggestions productos={accesorios} />
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
