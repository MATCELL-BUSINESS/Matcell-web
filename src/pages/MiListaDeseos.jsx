import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { getWishlistProductos } from '../lib/api'
import ProductCard from '../components/catalogo/ProductCard'
import './MiListaDeseos.css'

export default function MiListaDeseos() {
  const { user, loading } = useAuth()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!user) return
    getWishlistProductos(user.id)
      .then(setProductos)
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [user])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="wishlist-page">
      <h1>Mi lista de deseos</h1>

      {cargando && <p className="wishlist-vacio">Cargando...</p>}

      {!cargando && productos.length === 0 && (
        <div className="wishlist-vacio">
          <FiHeart size={40} />
          <p>Todavía no has guardado productos.</p>
          <Link to="/" className="btn btn-primary">
            Ir al catálogo
          </Link>
        </div>
      )}

      <div className="wishlist-grid">
        {productos.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
    </div>
  )
}
