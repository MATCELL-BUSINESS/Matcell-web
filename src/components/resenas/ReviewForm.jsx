import { useRef, useState } from 'react'
import { FiStar } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import { crearResena } from '../../lib/api'
import './ReviewForm.css'

export default function ReviewForm({ productoId = null }) {
  const { profile } = useAuth()

  const [nombre, setNombre] = useState(profile?.nombre ?? '')
  const [ciudad, setCiudad] = useState('')
  const [calificacion, setCalificacion] = useState(0)
  const [calificacionHover, setCalificacionHover] = useState(0)
  const [comentario, setComentario] = useState('')
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState(false)
  const [error, setError] = useState(null)
  const fotoInputRef = useRef(null)

  const formValido = nombre.trim() && calificacion > 0 && comentario.trim()

  const handleFoto = (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    if (!['image/jpeg', 'image/png'].includes(archivo.type)) {
      setError('Solo se aceptan imágenes JPG o PNG.')
      return
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar 5 MB.')
      return
    }
    setError(null)
    setFoto(archivo)
    setFotoPreview(URL.createObjectURL(archivo))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formValido) return

    setEnviando(true)
    setError(null)
    try {
      let fotoUrl = null
      if (foto) {
        const ext = foto.name.split('.').pop()
        const ruta = `resenas/${crypto.randomUUID()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('reseñas')
          .upload(ruta, foto, { contentType: foto.type, upsert: false })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('reseñas').getPublicUrl(ruta)
        fotoUrl = urlData.publicUrl
      }

      await crearResena({
        productoId,
        nombre: nombre.trim(),
        ciudad: ciudad.trim(),
        calificacion,
        comentario: comentario.trim(),
        fotoUrl,
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

      <div className="review-form-foto">
        <span className="review-form-foto-label">Foto (opcional)</span>
        {fotoPreview ? (
          <div className="review-form-foto-preview">
            <img src={fotoPreview} alt="Vista previa" />
            <button
              type="button"
              className="review-form-foto-quitar"
              onClick={() => { setFoto(null); setFotoPreview(null); fotoInputRef.current.value = '' }}
            >
              Quitar
            </button>
          </div>
        ) : (
          <label className="review-form-foto-btn">
            Subir imagen
            <input
              ref={fotoInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFoto}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>

      {error && <p className="review-form-error">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={!formValido || enviando}>
        {enviando ? 'Enviando...' : 'Enviar reseña'}
      </button>
    </form>
  )
}
