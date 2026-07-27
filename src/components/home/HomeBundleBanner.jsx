import { useNavigate } from 'react-router-dom'
import './HomeBundleBanner.css'

export default function HomeBundleBanner() {
  const navigate = useNavigate()

  return (
    <section className="home-bundle-banner">
      <span className="hbb-label">ACCESORIOS</span>
      <h2 className="hbb-titulo">Lleva más, paga menos.</h2>
      <p className="hbb-subtitulo">
        El descuento se aplica automáticamente en el carrito según el producto.
      </p>

      <div className="hbb-cards">
        <div className="hbb-card">
          <p className="hbb-card-qty">1 unidad</p>
          <p className="hbb-card-precio">Precio normal</p>
        </div>

        <div className="hbb-card hbb-card--popular">
          <span className="hbb-popular-badge">Más popular</span>
          <p className="hbb-card-qty">2 unidades</p>
          <p className="hbb-card-precio">Precio especial</p>
        </div>

        <div className="hbb-card">
          <p className="hbb-card-qty">3 o más</p>
          <p className="hbb-card-precio">
            Hasta 25% off <span className="hbb-por-unidad">por unidad</span>
          </p>
        </div>
      </div>

      <button className="hbb-cta" onClick={() => navigate('/catalogo/accesorios')}>
        Ver accesorios →
      </button>
    </section>
  )
}
