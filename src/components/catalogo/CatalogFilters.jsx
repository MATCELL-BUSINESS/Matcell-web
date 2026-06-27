import { useState } from 'react'
import { FiChevronDown, FiX } from 'react-icons/fi'
import './CatalogFilters.css'

const PRECIO_RANGOS = [
  { label: 'Menos de $500.000', min: 0, max: 500000 },
  { label: '$500.000 - $1.000.000', min: 500000, max: 1000000 },
  { label: '$1.000.000 - $2.000.000', min: 1000000, max: 2000000 },
  { label: 'Más de $2.000.000', min: 2000000, max: null },
]

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`filter-section ${open ? 'open' : ''}`}>
      <button className="filter-section-title" onClick={() => setOpen((o) => !o)}>
        {title}
        <FiChevronDown className="chevron" />
      </button>
      <div className="filter-section-body">{children}</div>
    </div>
  )
}

export default function CatalogFilters({
  mostrarEstado,
  subcategorias,
  filtros,
  onChange,
  mobileOpen,
  onCloseMobile,
}) {
  const setFiltro = (key, value) => {
    onChange({ ...filtros, [key]: value })
  }

  const limpiarFiltros = () => {
    onChange({ estado: null, subcategoriaId: null, precioMin: null, precioMax: null })
  }

  const hayFiltrosActivos =
    filtros.estado || filtros.subcategoriaId || filtros.precioMin != null

  return (
    <aside className={`catalog-filters ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="filters-mobile-header">
        <h3>Filtros</h3>
        <button onClick={onCloseMobile} aria-label="Cerrar filtros">
          <FiX size={22} />
        </button>
      </div>

      {hayFiltrosActivos && (
        <button className="clear-filters" onClick={limpiarFiltros}>
          Limpiar filtros
        </button>
      )}

      {mostrarEstado && (
        <FilterSection title="Estado">
          {['Nuevo', 'Seminuevo'].map((label) => {
            const value = label.toLowerCase()
            return (
              <label key={value} className="filter-option">
                <input
                  type="radio"
                  name="estado"
                  checked={filtros.estado === value}
                  onChange={() =>
                    setFiltro('estado', filtros.estado === value ? null : value)
                  }
                />
                {label}
              </label>
            )
          })}
        </FilterSection>
      )}

      {subcategorias.length > 0 && (
        <FilterSection title="Subcategoría">
          {subcategorias.map((sub) => (
            <label key={sub.id} className="filter-option">
              <input
                type="radio"
                name="subcategoria"
                checked={filtros.subcategoriaId === sub.id}
                onChange={() =>
                  setFiltro(
                    'subcategoriaId',
                    filtros.subcategoriaId === sub.id ? null : sub.id
                  )
                }
              />
              {sub.nombre}
            </label>
          ))}
        </FilterSection>
      )}

      <FilterSection title="Precio">
        {PRECIO_RANGOS.map((rango) => {
          const isActive =
            filtros.precioMin === rango.min && filtros.precioMax === rango.max
          return (
            <label key={rango.label} className="filter-option">
              <input
                type="radio"
                name="precio"
                checked={isActive}
                onChange={() =>
                  onChange(
                    isActive
                      ? { ...filtros, precioMin: null, precioMax: null }
                      : { ...filtros, precioMin: rango.min, precioMax: rango.max }
                  )
                }
              />
              {rango.label}
            </label>
          )
        })}
      </FilterSection>
    </aside>
  )
}
