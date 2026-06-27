import { Link } from 'react-router-dom'
import { formatCOP } from '../../lib/format'
import WishlistHeart from '../producto/WishlistHeart'
import './ProductCard.css'

const STOCK_BAJO_UMBRAL = 3

export default function ProductCard({ producto }) {
  const stockBajo = producto.stock > 0 && producto.stock <= STOCK_BAJO_UMBRAL

  return (
    <Link to={`/producto/${producto.id}`} className="product-card">
      <div className="product-image">
        {producto.foto_portada ? (
          <img src={producto.foto_portada} alt={producto.nombre} />
        ) : (
          <div className="product-image-placeholder" />
        )}
        <span className="product-condition">
          {producto.estado === 'seminuevo' ? 'Seminuevo' : 'Nuevo'}
        </span>
        <WishlistHeart productoId={producto.id} className="product-card-heart" />
      </div>

      <div className="product-info">
        <p className="product-name">{producto.nombre}</p>
        <div className="product-price">
          {producto.precioDesde != null ? (
            <span className="price-current">Desde {formatCOP(producto.precioDesde)}</span>
          ) : (
            <>
              <span className="price-current">{formatCOP(producto.precio)}</span>
              {producto.en_oferta && producto.precio_anterior && (
                <span className="price-old">{formatCOP(producto.precio_anterior)}</span>
              )}
            </>
          )}
        </div>
        {stockBajo && (
          <p className="product-stock-low">Quedan {producto.stock} unidades</p>
        )}
      </div>
    </Link>
  )
}
