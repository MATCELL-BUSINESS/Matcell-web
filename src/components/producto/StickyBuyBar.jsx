import { useEffect, useRef, useState } from 'react'
import { FiShoppingCart } from 'react-icons/fi'
import { formatCOP } from '../../lib/format'
import './StickyBuyBar.css'

export default function StickyBuyBar({ producto, precio, agotado, onAddToCart, onBuyNow, ctaRef }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ctaRef?.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const show = !entry.isIntersecting
        setVisible(show)
        document.body.classList.toggle('sticky-buy-active', show)
      },
      { threshold: 0 }
    )
    observer.observe(ctaRef.current)
    return () => {
      observer.disconnect()
      document.body.classList.remove('sticky-buy-active')
    }
  }, [ctaRef])

  return (
    <div className={`sticky-buy-bar ${visible ? 'sticky-buy-bar--visible' : ''}`}>
      <div className="sticky-buy-info">
        <p className="sticky-buy-name">{producto.nombre}</p>
        <p className="sticky-buy-price">{formatCOP(precio ?? producto.precio)}</p>
      </div>
      <div className="sticky-buy-actions">
        <button
          className="btn btn-secondary sticky-btn-cart"
          onClick={onAddToCart}
          disabled={agotado}
        >
          <FiShoppingCart size={16} />
          <span className="sticky-btn-label">Carrito</span>
        </button>
        <button
          className="btn btn-primary sticky-btn-buy sticky-bounce"
          onClick={onBuyNow}
          disabled={agotado}
        >
          {agotado ? 'Agotado' : 'Comprar ahora'}
        </button>
      </div>
    </div>
  )
}
