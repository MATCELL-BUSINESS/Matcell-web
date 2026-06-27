import ProductCard from '../catalogo/ProductCard'
import './AccessorySuggestions.css'

export default function AccessorySuggestions({ productos = [] }) {
  if (productos.length === 0) return null

  return (
    <section className="accessory-suggestions">
      <h2>Completa tu compra</h2>
      <div className="accessory-grid">
        {productos.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
    </section>
  )
}
