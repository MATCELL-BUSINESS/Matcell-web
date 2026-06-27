import { FiShoppingCart } from 'react-icons/fi'
import { formatCOP } from '../../lib/format'
import './StickyBuyBar.css'

export default function StickyBuyBar({ producto, precio, agotado, onAddToCart }) {
  return (
    <div className="sticky-buy-bar">
      <div className="sticky-buy-info">
        <p className="sticky-buy-name">{producto.nombre}</p>
        <p className="sticky-buy-price">{formatCOP(precio ?? producto.precio)}</p>
      </div>
      <button className="btn btn-primary" onClick={onAddToCart} disabled={agotado}>
        <FiShoppingCart size={16} />
        {agotado ? 'Agotado' : 'Agregar al carrito'}
      </button>
    </div>
  )
}
