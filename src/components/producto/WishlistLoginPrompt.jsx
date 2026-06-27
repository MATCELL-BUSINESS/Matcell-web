import { Link } from 'react-router-dom'
import { FiHeart, FiX } from 'react-icons/fi'
import './WishlistLoginPrompt.css'

export default function WishlistLoginPrompt({ onClose }) {
  return (
    <div className="wishlist-prompt-backdrop" onClick={onClose}>
      <div className="wishlist-prompt" onClick={(e) => e.stopPropagation()}>
        <button className="wishlist-prompt-close" onClick={onClose} aria-label="Cerrar">
          <FiX size={18} />
        </button>

        <FiHeart size={32} className="wishlist-prompt-icon" />
        <h3>Guarda tus productos favoritos</h3>
        <p>Inicia sesión o crea una cuenta para guardar este producto en tu lista de deseos.</p>

        <div className="wishlist-prompt-actions">
          <Link to="/login" className="btn btn-primary" onClick={onClose}>
            Iniciar sesión
          </Link>
          <Link to="/registro" className="btn btn-secondary" onClick={onClose}>
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  )
}
