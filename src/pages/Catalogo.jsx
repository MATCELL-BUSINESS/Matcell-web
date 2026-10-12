import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiFilter, FiSearch, FiX } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
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
  const [busquedaCompat, setBusquedaCompat] = useState('')
  const compatInputRef = useRef(null)

  const esOfertas = slug === 'ofertas'
  const esAccesorios = slug === 'accesorios'

  useEffect(() => {
    setFiltros({ estado: null, subcategoriaId: null, precioMin: null, precioMax: null })
    setOrden('relevancia')
    setBusquedaCompat('')

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

  // Filtro de compatibilidad en cliente (solo accesorios)
  const terminoCompat = busquedaCompat.trim().toLowerCase()
  const productosFiltrados = esAccesorios && terminoCompat.length >= 2
    ? productos.filter((p) =>
        (p.producto_variantes ?? []).some(
          (v) => v.stock > 0 && v.modelo_compatible?.toLowerCase().includes(terminoCompat)
        )
      )
    : productos

  const whatsappCompatHref = `https://wa.me/573046789119?text=${encodeURIComponent(`Hola, busco accesorios compatibles con: ${busquedaCompat.trim()}`)}`

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
          {esAccesorios && (
            <div className="compat-search-wrap">
              <div className="compat-search-field">
                <FiSearch size={16} className="compat-search-icon" />
                <input
                  ref={compatInputRef}
                  type="text"
                  className="compat-search-input"
                  placeholder="¿Para qué modelo? Ej: iPhone 13 Pro Max"
                  value={busquedaCompat}
                  onChange={(e) => setBusquedaCompat(e.target.value)}
                />
                {busquedaCompat && (
                  <button
                    className="compat-search-clear"
                    onClick={() => { setBusquedaCompat(''); compatInputRef.current?.focus() }}
                    aria-label="Limpiar búsqueda"
                  >
                    <FiX size={15} />
                  </button>
                )}
              </div>
              {terminoCompat.length >= 2 && (
                <div className="compat-chip">
                  <span>Filtrando por: {busquedaCompat.trim()}</span>
                  <button onClick={() => setBusquedaCompat('')} aria-label="Quitar filtro">
                    <FiX size={13} />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="catalogo-toolbar">
            <p className="results-count">
              {cargandoProductos
                ? 'Cargando productos...'
                : `${productosFiltrados.length} producto${productosFiltrados.length === 1 ? '' : 's'}`}
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

          {!cargandoProductos && productosFiltrados.length === 0 ? (
            esAccesorios && terminoCompat.length >= 2 ? (
              <div className="no-resultados-compat">
                <p>No encontramos accesorios disponibles para ese modelo.</p>
                <p className="no-resultados-compat-sub">Escríbenos por WhatsApp y te ayudamos.</p>
                <a href={whatsappCompatHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary no-resultados-compat-btn">
                  <FaWhatsapp size={18} />
                  Escribir por WhatsApp
                </a>
              </div>
            ) : (
              <p className="no-resultados">No encontramos productos con estos filtros.</p>
            )
          ) : (
            <div className="catalogo-grid">
              {productosFiltrados.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
