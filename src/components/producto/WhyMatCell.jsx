import { Link } from 'react-router-dom'
import './WhyMatCell.css'

const BENEFICIOS = [
  'Equipos verificados',
  'Garantía incluida',
  'Soporte por WhatsApp',
  'Precio justo',
  'Compra por videollamada',
  'Despacho el mismo día',
]

export default function WhyMatCell() {
  return (
    <section className="why-matcell">
      <div className="why-col-left">
        <h2 className="why-titulo">¿Por qué elegir MatCell?</h2>
        <p className="why-texto">
          Verificamos cada equipo, incluimos garantía y te acompañamos en cada paso.
          Sin intermediarios, sin sorpresas.
        </p>

        <hr className="why-sep" />

        <h3 className="why-subtitulo">¿Emprendedor o comerciante?</h3>
        <p className="why-texto">
          Podemos ser tu proveedor. Únete y accede a precios preferenciales, stock
          constante y márgenes atractivos vendiendo tecnología de alta demanda.
        </p>

        <Link to="/mayoristas" className="why-btn">
          Vende con nosotros →
        </Link>
      </div>

      <div className="why-col-right">
        <div className="why-tabla">
          {/* Header */}
          <div className="why-cell why-cell--h1" />
          <div className="why-cell why-cell--h2">MatCell</div>
          <div className="why-cell why-cell--h3">Otros</div>

          {BENEFICIOS.map((b) => (
            <>
              <div key={`${b}-label`} className="why-cell why-cell--label">{b}</div>
              <div key={`${b}-si`} className="why-cell why-cell--si">✓</div>
              <div key={`${b}-no`} className="why-cell why-cell--no">✕</div>
            </>
          ))}
        </div>
      </div>
    </section>
  )
}
