import { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import './FAQ.css'

const FAQS = [
  {
    question: '¿Qué significa que un iPhone esté "certificado"?',
    answer:
      'Significa que el equipo pasó por una revisión técnica completa (batería, pantalla, cámaras y funcionamiento general) y, si fue necesario, se repararon los componentes con piezas originales o certificadas antes de salir a la venta.',
  },
  {
    question: '¿Cuánto dura la garantía?',
    answer:
      'Los iPhones certificados tienen hasta 12 meses de garantía. Los accesorios cuentan con 3 meses, y todos nuestros productos tienen 1 mes adicional de cambio por garantía extendida.',
  },
  {
    question: '¿Hacen envíos a toda Colombia?',
    answer:
      'Sí, enviamos a todo el país. El envío es gratuito en compras desde $400.000 y también ofrecemos recogida local en Ciénaga, Magdalena.',
  },
  {
    question: '¿Puedo pagar contra entrega?',
    answer:
      'No manejamos pago contraentrega. Todos los pagos se procesan de forma 100% segura y verificada a través de Wompi, con tarjeta de crédito/débito, PSE, Crédito Nequi o Bancolombia BNPL (compra ahora, paga después).',
  },
  {
    question: '¿Qué pasa si mi producto llega con una falla?',
    answer:
      'Cuentas con garantía desde el primer día. Escríbenos por WhatsApp y coordinamos la revisión, reparación o cambio del producto sin costo adicional.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="faq">
      <h2>Preguntas frecuentes</h2>
      <div className="faq-list">
        {FAQS.map((item, index) => {
          const isOpen = openIndex === index
          return (
            <div key={item.question} className={`faq-item ${isOpen ? 'open' : ''}`}>
              <button
                className="faq-question"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                {item.question}
                <FiChevronDown className="faq-chevron" />
              </button>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
