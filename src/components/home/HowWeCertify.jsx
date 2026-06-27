import { FiSearch, FiTool, FiCheckCircle, FiShield } from 'react-icons/fi'
import './HowWeCertify.css'

const STEPS = [
  {
    icon: FiSearch,
    title: 'Revisión técnica',
    desc: 'Evaluamos batería, pantalla, cámaras y componentes internos con equipos especializados.',
  },
  {
    icon: FiTool,
    title: 'Diagnóstico y reparación',
    desc: 'Si encontramos alguna falla, la corregimos con repuestos originales o certificados.',
  },
  {
    icon: FiCheckCircle,
    title: 'Certificación de calidad',
    desc: 'Solo aprobamos los equipos que cumplen nuestros estándares de funcionamiento y estética.',
  },
  {
    icon: FiShield,
    title: 'Garantía real',
    desc: 'Cada equipo certificado sale respaldado con garantía y soporte postventa.',
  },
]

export default function HowWeCertify() {
  return (
    <section className="how-we-certify" id="como-certificamos">
      <h2>Cómo certificamos</h2>
      <p className="section-subtext">
        Cada equipo pasa por un proceso de 4 etapas antes de llegar a tus manos.
      </p>

      <div className="steps-grid">
        {STEPS.map(({ icon: Icon, title, desc }, index) => (
          <div key={title} className="step-card">
            <span className="step-number">{index + 1}</span>
            <Icon size={28} />
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
