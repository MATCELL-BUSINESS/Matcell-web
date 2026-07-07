import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag, FiTag } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import { getEnvioNacional, getAccesoriosSugeridos, getBundlesParaCarrito, getSubcategoriasBundleParaCarrito } from '../../lib/api'
import { formatCOP, formatVariante } from '../../lib/format'
import ShippingProgress from './ShippingProgress'
import './CartDrawer.css'

function calcularBundle(precioBase, cantidad, tipo, descuento) {
  const descPorUnidad = tipo === 'porcentaje'
    ? Math.round(precioBase * Number(descuento) / 100)
    : Number(descuento)
  const precioUnitario = Math.max(0, precioBase - descPorUnidad)
  const totalBase = precioBase * cantidad
  const totalConDesc = precioUnitario * cantidad
  return { totalBase, totalConDesc, ahorro: totalBase - totalConDesc, precioUnitario }
}

export default function CartDrawer() {
  const { items, removeItem, updateCantidad, applyBundle, applyCategoriBundle, subtotal, drawerOpen, closeDrawer, addItem } =
    useCart()
  const navigate = useNavigate()

  const [envio, setEnvio] = useState(null)
  const [sugeridos, setSugeridos] = useState([])
  const [bundles, setBundles] = useState({})
  const [subcategoriasBundles, setSubcategoriasBundles] = useState({})

  useEffect(() => {
    getEnvioNacional().then(setEnvio).catch(console.error)
  }, [])

  useEffect(() => {
    if (!drawerOpen) return
    const idsEnCarrito = items.map((item) => item.productoId)
    const subcatIds = [...new Set(items.map((i) => i.subcategoriaId).filter(Boolean))]
    getAccesoriosSugeridos(idsEnCarrito, 3).then(setSugeridos).catch(console.error)
    getBundlesParaCarrito(idsEnCarrito).then(setBundles).catch(console.error)
    if (subcatIds.length) {
      getSubcategoriasBundleParaCarrito(subcatIds).then(setSubcategoriasBundles).catch(console.error)
    }
  }, [drawerOpen, items])

  // Detectar categorías mixtas: 2+ productoId distintos de la misma categoría
  const categoriasMixtas = (() => {
    const grupos = {}
    for (const item of items) {
      if (!item.subcategoriaId) continue
      if (!grupos[item.subcategoriaId]) grupos[item.subcategoriaId] = []
      grupos[item.subcategoriaId].push(item)
    }
    const resultado = []
    for (const [subcatId, subcatItems] of Object.entries(grupos)) {
      const productosDistintos = new Set(subcatItems.map((i) => i.productoId))
      if (productosDistintos.size < 2) continue
      const subcatBundle = subcategoriasBundles[subcatId]
      if (!subcatBundle?.bundle_descuento_x2) continue
      const itemsSinBundle = subcatItems.filter((i) => !i.esBundle)
      if (itemsSinBundle.length < 2) continue
      const descuento = subcatBundle.bundle_descuento_x2
      const ahorro = itemsSinBundle.reduce((acc, i) => acc + descuento * i.cantidad, 0)
      resultado.push({
        catId: subcatId,
        nombre: subcatBundle.nombre,
        items: itemsSinBundle,
        descuento,
        ahorro,
      })
    }
    return resultado
  })()

  const handleAgregarSugerido = (producto) => {
    addItem({
      productoId: producto.id,
      nombre: producto.nombre,
      foto: producto.foto_portada,
      precio: producto.precio,
      color: null,
      stockDisponible: null,
    })
  }

  const handleContinuar = () => {
    closeDrawer()
    navigate('/checkout')
  }

  const costoEnvioEstimado = envio?.costo ?? 0
  const total = subtotal + (subtotal >= (envio?.gratis_desde_monto ?? Infinity) ? 0 : costoEnvioEstimado)

  return (
    <>
      {drawerOpen && <div className="cart-backdrop" onClick={closeDrawer} />}

      <aside className={`cart-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h3>Tu carrito ({items.length})</h3>
          <button onClick={closeDrawer} aria-label="Cerrar carrito">
            <FiX size={22} />
          </button>
        </div>

        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <FiShoppingBag size={40} />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <>
              <ShippingProgress subtotal={subtotal} montoGratis={envio?.gratis_desde_monto} />

              {/* Banners de categorías mixtas */}
              {categoriasMixtas.map((grupo) => (
                <div key={grupo.catId} className="cart-cat-mix">
                  <div className="cart-cat-mix-banner">
                    <FiTag size={14} className="cart-cat-mix-icon" />
                    <div className="cart-cat-mix-info">
                      <p className="cart-cat-mix-titulo">
                        Oferta mix — {grupo.nombre}
                      </p>
                      <p className="cart-cat-mix-desc">
                        Llevás {grupo.items.length} accesorios distintos · Descuento{' '}
                        {formatCOP(grupo.descuento)}/u
                      </p>
                      <p className="cart-cat-mix-ahorro">Ahorras {formatCOP(grupo.ahorro)}</p>
                    </div>
                    <button
                      className="cart-cat-mix-btn"
                      onClick={() =>
                        applyCategoriBundle(
                          grupo.items.map((i) => i.cartItemId),
                          grupo.descuento
                        )
                      }
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              ))}

              <div className="cart-items">
                {items.map((item) => {
                  const bundle = bundles[item.productoId]
                  const precioBase = item.precioOriginal ?? item.precio

                  let bundleOferta = null
                  if (bundle && !item.esBundle) {
                    if (bundle.bundle_3_activo && item.cantidad >= 2) {
                      const b = calcularBundle(precioBase, 3, bundle.bundle_3_tipo, bundle.bundle_3_descuento)
                      const desc = bundle.bundle_3_tipo === 'porcentaje' ? `${bundle.bundle_3_descuento}%` : formatCOP(bundle.bundle_3_descuento)
                      bundleOferta = { cantidad: 3, ...b, descripcion: `Bundle x3 mismo modelo – ${desc}/u` }
                    } else if (bundle.bundle_2_activo && item.cantidad < 2) {
                      const b = calcularBundle(precioBase, 2, bundle.bundle_2_tipo, bundle.bundle_2_descuento)
                      const desc = bundle.bundle_2_tipo === 'porcentaje' ? `${bundle.bundle_2_descuento}%` : formatCOP(bundle.bundle_2_descuento)
                      bundleOferta = { cantidad: 2, ...b, descripcion: `Bundle x2 mismo modelo – ${desc}/u` }
                    }
                  }

                  return (
                    <div key={item.cartItemId} className="cart-item-wrap">
                      <div className="cart-item">
                        <div className="cart-item-image">
                          {item.foto ? <img src={item.foto} alt={item.nombre} /> : null}
                        </div>

                        <div className="cart-item-info">
                          <p className="cart-item-name">{item.nombre}</p>
                          {item.color && <p className="cart-item-color">Color: {formatVariante(item.color)}</p>}
                          <p className="cart-item-price">
                            {formatCOP(item.precio)}
                            {item.esBundle && item.precioOriginal && item.precioOriginal !== item.precio && (
                              <span className="cart-item-price-original">{formatCOP(item.precioOriginal)}</span>
                            )}
                          </p>

                          <div className="cart-item-qty">
                            <button
                              onClick={() => updateCantidad(item.cartItemId, item.cantidad - 1)}
                              disabled={item.cantidad <= 1}
                              aria-label="Disminuir cantidad"
                            >
                              <FiMinus size={13} />
                            </button>
                            <span>{item.cantidad}</span>
                            <button
                              onClick={() => updateCantidad(item.cartItemId, item.cantidad + 1)}
                              disabled={
                                item.stockDisponible != null &&
                                item.cantidad >= item.stockDisponible
                              }
                              aria-label="Aumentar cantidad"
                            >
                              <FiPlus size={13} />
                            </button>
                          </div>
                        </div>

                        <button
                          className="cart-item-remove"
                          onClick={() => removeItem(item.cartItemId)}
                          aria-label="Eliminar producto"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>

                      {bundleOferta && (
                        <button
                          className="cart-bundle-oferta"
                          onClick={() => applyBundle(item.cartItemId, bundleOferta.cantidad, bundleOferta.precioUnitario, bundleOferta.descripcion)}
                        >
                          <FiTag size={13} />
                          <span className="cart-bundle-label">Lleva {bundleOferta.cantidad}</span>
                          <span className="cart-bundle-totales">
                            <s>{formatCOP(bundleOferta.totalBase)}</s>
                            {' '}<strong>{formatCOP(bundleOferta.totalConDesc)}</strong>
                          </span>
                          <span className="cart-bundle-ahorro">Ahorras {formatCOP(bundleOferta.ahorro)}</span>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {sugeridos.length > 0 && (
                <div className="cart-sugeridos">
                  <p className="cart-sugeridos-title">Agrega a tu compra</p>
                  {sugeridos.map((producto) => (
                    <div key={producto.id} className="cart-sugerido-item">
                      <div className="cart-item-image small">
                        {producto.foto_portada && (
                          <img src={producto.foto_portada} alt={producto.nombre} />
                        )}
                      </div>
                      <div className="cart-sugerido-info">
                        <p>{producto.nombre}</p>
                        <span>{formatCOP(producto.precio)}</span>
                      </div>
                      <button
                        className="cart-sugerido-add"
                        onClick={() => handleAgregarSugerido(producto)}
                        aria-label="Agregar al carrito"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>{formatCOP(subtotal)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Envío estimado</span>
              <span>
                {subtotal >= (envio?.gratis_desde_monto ?? Infinity)
                  ? 'Gratis'
                  : formatCOP(costoEnvioEstimado)}
              </span>
            </div>
            <div className="cart-summary-row total">
              <span>Total</span>
              <span>{formatCOP(total)}</span>
            </div>

            <button className="btn btn-primary cart-continue" onClick={handleContinuar}>
              Continuar al pago
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
