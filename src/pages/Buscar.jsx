import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { buscarProductos } from '../lib/api'
import ProductCard from '../components/catalogo/ProductCard'
import './Buscar.css'

export default function Buscar() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''

  const [resultados, setResultados] = useState([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (q.trim().length < 2) { setResultados([]); return }
    setCargando(true)
    buscarProductos(q)
      .then(setResultados)
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [q])

  return (
    <div className="buscar-page">
      <h1 className="buscar-titulo">
        {q ? <>Resultados para <span>"{q}"</span></> : 'Buscar productos'}
      </h1>

      {cargando && <p className="buscar-estado">Buscando...</p>}

      {!cargando && q.trim().length >= 2 && resultados.length === 0 && (
        <p className="buscar-estado buscar-vacio">
          No encontramos productos para "{q}".
        </p>
      )}

      {!cargando && resultados.length > 0 && (
        <>
          <p className="buscar-count">{resultados.length} producto{resultados.length === 1 ? '' : 's'}</p>
          <div className="buscar-grid">
            {resultados.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
