import { useState } from 'react'
import { FiStar } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { crearResena } from '../../lib/api'
import './ReviewForm.css'

export default function ReviewForm({ productoId = null }) {
  const { profile } = useAuth()

  const [nombre, setNombre] = useState(profile?.nombre ?? '')
  const [ciudad, setCiudad] = useState('')
  const [calificacion, setCalificacion] = useState(0)
  const [calificacionHover, setCalificacionHover] = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState(false)
  const [error, setError] = useState(null)

  const formValido = nombre.trim() && calificacion > 0 && comentario.trim()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formValido) return

    setEnviando(true)
    setError(null)
    try {
      await crearResena({
        productoId,
        nombre: nombre.trim(),
        ciudad: ciudad.trim(),
        calificacion,
        comentario: comentario.trim(),
      })
      setEnviada(true)
    } catch (err) {
      console.error(err)
      setError('No pudimos enviar tu reseña. Intenta de nuevo en unos segundos.')
    } finally {
      setEnviando(false)
    }
  }

  if (enviada) {
    return (
      <div className="review-form-exito">
        <p>¡Gracias! Tu reseña será publicada después de revisarla.</p>
      </div>
    )
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="review-form-row">
        <label>
          Nombre
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </label>
        <label>
          Ciudad (opcional)
          <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
        </label>
      </div>

      <div className="review-form-stars">
        <p>Calificación</p>
        <div className="review-form-stars-row">
          {Array.from({ length: 5 }).map((_, i) => {
            const valor = i + 1
            const activa = valor <= (calificacionHover || calificacion)
            return (
              <button
                key={valor}
                type="button"
                className="review-star-btn"
                onMouseEnter={() => setCalificacionHover(valor)}
                onMouseLeave={() => setCalificacionHover(0)}
                onClick={() => setCalificacion(valor)}
                aria-label={`${valor} estrellas`}
              >
                <FiStar size={22} fill={activa ? 'currentColor' : 'none'} />
              </button>
            )
          })}
        </div>
      </div>

      <label>
        Comentario
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={4}
          required
        />
      </label>

      {error && <p className="review-form-error">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={!formValido || enviando}>
        {enviando ? 'Enviando...' : 'Enviar reseña'}
      </button>
    </form>
  )
}
