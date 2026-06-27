import { FiHeart } from 'react-icons/fi'
import { useWishlist } from '../../context/WishlistContext'
import './WishlistHeart.css'

export default function WishlistHeart({ productoId, className = '' }) {
  const { isInWishlist, toggle } = useWishlist()
  const activo = isInWishlist(productoId)

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(productoId)
  }

  return (
    <button
      className={`wishlist-heart ${activo ? 'active' : ''} ${className}`}
      onClick={handleClick}
      aria-label={activo ? 'Quitar de lista de deseos' : 'Agregar a lista de deseos'}
    >
      <FiHeart size={17} fill={activo ? 'currentColor' : 'none'} />
    </button>
  )
}
