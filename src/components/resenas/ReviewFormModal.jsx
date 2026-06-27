import { FiX } from 'react-icons/fi'
import ReviewForm from './ReviewForm'
import './ReviewFormModal.css'

export default function ReviewFormModal({ onClose }) {
  return (
    <div className="review-modal-backdrop" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <h3>Escribir una reseña</h3>
          <button onClick={onClose} aria-label="Cerrar">
            <FiX size={20} />
          </button>
        </div>
        <ReviewForm />
      </div>
    </div>
  )
}
