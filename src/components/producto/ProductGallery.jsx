import { useEffect, useRef, useState } from 'react'
import { FiImage } from 'react-icons/fi'
import './ProductGallery.css'

export default function ProductGallery({ fotos = [], nombre, irAIndice = -1 }) {
  const [activa, setActiva] = useState(0)
  const thumbsRef = useRef(null)

  useEffect(() => {
    if (irAIndice >= 0 && irAIndice < fotos.length) {
      setActiva(irAIndice)
      // Scroll la miniatura activa dentro del carrusel de thumbs
      const thumb = thumbsRef.current?.children[irAIndice]
      thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [irAIndice])

  if (fotos.length === 0) {
    return (
      <div className="product-gallery">
        <div className="gallery-main gallery-placeholder">
          <FiImage size={48} />
          <p>Sin foto disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="product-gallery">
      <div className="gallery-main">
        <img src={fotos[activa].url} alt={nombre} />
      </div>

      {fotos.length > 1 && (
        <div className="gallery-thumbs" ref={thumbsRef}>
          {fotos.map((foto, index) => (
            <button
              key={foto.url + index}
              className={`gallery-thumb ${index === activa ? 'active' : ''}`}
              onClick={() => setActiva(index)}
              aria-label={`Ver foto ${index + 1}`}
            >
              <img src={foto.url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
