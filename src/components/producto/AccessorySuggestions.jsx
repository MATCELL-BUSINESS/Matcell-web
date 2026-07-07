import ProductCard from '../catalogo/ProductCard'
import './AccessorySuggestions.css'

export default function AccessorySuggestions({ productos = [], esAccesorio = false }) {
  if (productos.length === 0) return null

  const titulo = esAccesorio ? 'Completa tu setup' : 'También te puede interesar'

  return (
    <section className="accessory-suggestions">
      <h2>{titulo}</h2>
      <div className="accessory-grid">
        {productos.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
    </section>
  )
}
