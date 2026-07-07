import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag, FiTag } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import { getEnvioNacional, getAccesoriosSugeridos, getBundlesParaCarrito } from '../../lib/api'
import { formatCOP } from '../../lib/format'
import ShippingProgress from './ShippingProgress'
import './CartDrawer.css'

function calcularPrecioBundle(precioBase, tipo, descuento) {
  if (tipo === 'porcentaje') return Math.round(precioBase * (1 - descuento / 100))
  return Math.max(0, Math.round(precioBase - descuento))
}

export default function CartDrawer() {
  const { items, removeItem, updateCantidad, applyBundle, subtotal, drawerOpen, closeDrawer, addItem } =
    useCart()
  const navigate = useNavigate()

  const [envio, setEnvio] = useState(null)
  const [sugeridos, setSugeridos] = useState([])
  const [bundles, setBundles] = useState({})

  useEffect(() => {
    getEnvioNacional().then(setEnvio).catch(console.error)
  }, [])

  useEffect(() => {
    if (!drawerOpen) return
    const idsEnCarrito = items.map((item) => item.productoId)
    getAccesoriosSugeridos(idsEnCarrito, 3).then(setSugeridos).catch(console.error)
    getBundlesParaCarrito(idsEnCarrito).then(setBundles).catch(console.error)
  }, [drawerOpen, items])

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

              <div className="cart-items">
                {items.map((item) => {
                  const bundle = bundles[item.productoId]
                  const precioBase = item.precioOriginal ?? item.precio

                  // Determina qué tier de bundle ofrecer
                  let bundleOferta = null
                  if (bundle) {
                    if (bundle.bundle_3_activo && item.cantidad >= 2) {
                      const precio = calcularPrecioBundle(precioBase, bundle.bundle_3_tipo, bundle.bundle_3_descuento)
                      const desc = bundle.bundle_3_tipo === 'porcentaje'
                        ? `${bundle.bundle_3_descuento}% dto.`
                        : formatCOP(bundle.bundle_3_descuento) + ' menos'
                      bundleOferta = { cantidad: 3, precio, label: `Lleva 3 y ahorra ${desc} c/u`, descripcion: `Bundle x3 – ${desc}` }
                    } else if (bundle.bundle_2_activo && item.cantidad < 2) {
                      const precio = calcularPrecioBundle(precioBase, bundle.bundle_2_tipo, bundle.bundle_2_descuento)
                      const desc = bundle.bundle_2_tipo === 'porcentaje'
                        ? `${bundle.bundle_2_descuento}% dto.`
                        : formatCOP(bundle.bundle_2_descuento) + ' menos'
                      bundleOferta = { cantidad: 2, precio, label: `Lleva 2 y ahorra ${desc} c/u`, descripcion: `Bundle x2 – ${desc}` }
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
                          {item.color && <p className="cart-item-color">Color: {item.color}</p>}
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
                          onClick={() => applyBundle(item.cartItemId, bundleOferta.cantidad, bundleOferta.precio, bundleOferta.descripcion)}
                        >
                          <FiTag size={13} />
                          <span>{bundleOferta.label}</span>
                          <span className="cart-bundle-precio">{formatCOP(bundleOferta.precio)} c/u</span>
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
