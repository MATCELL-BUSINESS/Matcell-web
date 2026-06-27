import { FiStar } from 'react-icons/fi'
import './ProductReviews.css'

export default function ProductReviews({ resenas = [], esEspecifica }) {
  if (resenas.length === 0) return null

  return (
    <section className="product-reviews">
      <h2>{esEspecifica ? 'Reseñas de este equipo' : 'Lo que dicen nuestros clientes'}</h2>
      <div className="product-reviews-scroll">
        {resenas.map((resena) => (
          <div key={resena.id} className="product-review-card">
            <div className="review-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar
                  key={i}
                  size={14}
                  fill={i < resena.calificacion ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <p className="review-comment">"{resena.comentario}"</p>
            <p className="review-author">
              {resena.nombre_cliente}
              {resena.ciudad && <span> &middot; {resena.ciudad}</span>}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
