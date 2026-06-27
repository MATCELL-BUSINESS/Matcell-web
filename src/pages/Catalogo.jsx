import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiFilter } from 'react-icons/fi'
import {
  getCategoriaBySlug,
  getSubcategorias,
  getProductosCatalogo,
} from '../lib/api'
import Breadcrumbs from '../components/catalogo/Breadcrumbs'
import CatalogFilters from '../components/catalogo/CatalogFilters'
import ProductCard from '../components/catalogo/ProductCard'
import './Catalogo.css'

const NOMBRES_ESPECIALES = {
  ofertas: 'Ofertas',
}

export default function Catalogo() {
  const { slug } = useParams()

  const [categoria, setCategoria] = useState(null)
  const [categoriaCargada, setCategoriaCargada] = useState(false)
  const [subcategorias, setSubcategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [orden, setOrden] = useState('relevancia')
  const [filtros, setFiltros] = useState({
    estado: null,
    subcategoriaId: null,
    precioMin: null,
    precioMax: null,
  })
  const [filtrosMobileOpen, setFiltrosMobileOpen] = useState(false)

  const esOfertas = slug === 'ofertas'

  useEffect(() => {
    setFiltros({ estado: null, subcategoriaId: null, precioMin: null, precioMax: null })
    setOrden('relevancia')

    if (esOfertas) {
      setCategoria(null)
      setSubcategorias([])
      setCategoriaCargada(true)
      return
    }

    setCategoriaCargada(false)
    getCategoriaBySlug(slug)
      .then((cat) => {
        setCategoria(cat)
        setCategoriaCargada(true)
        return cat ? getSubcategorias(cat.id) : []
      })
      .then(setSubcategorias)
      .catch(console.error)
  }, [slug, esOfertas])

  useEffect(() => {
    if (!categoriaCargada) return
    if (!esOfertas && !categoria) {
      setProductos([])
      setCargandoProductos(false)
      return
    }

    setCargandoProductos(true)
    getProductosCatalogo({
      categoriaSlug: slug,
      categoriaId: categoria?.id,
      subcategoriaId: filtros.subcategoriaId,
      estado: filtros.estado,
      precioMin: filtros.precioMin,
      precioMax: filtros.precioMax,
      orden,
    })
      .then(setProductos)
      .catch(console.error)
      .finally(() => setCargandoProductos(false))
  }, [categoriaCargada, categoria, esOfertas, slug, filtros, orden])

  const nombreCategoria =
    NOMBRES_ESPECIALES[slug] ?? categoria?.nombre ?? (categoriaCargada ? 'Categoría no encontrada' : '')

  const mostrarEstado = slug === 'iphone'

  if (categoriaCargada && !esOfertas && !categoria) {
    return (
      <div className="catalogo-vacio">
        <h1>Categoría no encontrada</h1>
        <p>La categoría que buscas no existe o ya no está disponible.</p>
      </div>
    )
  }

  return (
    <div className="catalogo-page">
      <Breadcrumbs current={nombreCategoria} />

      <div className="catalogo-header">
        <h1>{nombreCategoria}</h1>
        <button
          className="filters-toggle"
          onClick={() => setFiltrosMobileOpen(true)}
        >
          <FiFilter size={16} />
          Filtros
        </button>
      </div>

      <div className="catalogo-body">
        <CatalogFilters
          mostrarEstado={mostrarEstado}
          subcategorias={subcategorias}
          filtros={filtros}
          onChange={setFiltros}
          mobileOpen={filtrosMobileOpen}
          onCloseMobile={() => setFiltrosMobileOpen(false)}
        />

        {filtrosMobileOpen && (
          <div
            className="filters-backdrop"
            onClick={() => setFiltrosMobileOpen(false)}
          />
        )}

        <div className="catalogo-content">
          <div className="catalogo-toolbar">
            <p className="results-count">
              {cargandoProductos
                ? 'Cargando productos...'
                : `${productos.length} producto${productos.length === 1 ? '' : 's'}`}
            </p>

            <select
              className="sort-select"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              <option value="relevancia">Más relevantes</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
            </select>
          </div>

          {!cargandoProductos && productos.length === 0 ? (
            <p className="no-resultados">
              No encontramos productos con estos filtros.
            </p>
          ) : (
            <div className="catalogo-grid">
              {productos.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
