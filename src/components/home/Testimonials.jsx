import { useState } from 'react'
import { FiStar } from 'react-icons/fi'
import ReviewFormModal from '../resenas/ReviewFormModal'
import './Testimonials.css'

export default function Testimonials({ resenas = [] }) {
  const [modalOpen, setModalOpen] = useState(false)

  if (resenas.length === 0) return null

  return (
    <section className="testimonials">
      <div className="testimonials-header">
        <h2>Estos son algunos de nuestros clientes</h2>
        <button className="btn btn-secondary" onClick={() => setModalOpen(true)}>
          Escribir una reseña
        </button>
      </div>

      <div className="testimonials-scroll">
        {resenas.map((resena) => (
          <div key={resena.id} className="testimonial-card">
            <div className="testimonial-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar
                  key={i}
                  size={15}
                  fill={i < resena.calificacion ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <p className="testimonial-comment">"{resena.comentario}"</p>
            <p className="testimonial-author">
              {resena.nombre_cliente}
              {resena.ciudad && <span> &middot; {resena.ciudad}</span>}
            </p>
          </div>
        ))}
      </div>

      {modalOpen && <ReviewFormModal onClose={() => setModalOpen(false)} />}
    </section>
  )
}
