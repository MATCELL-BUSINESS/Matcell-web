import { useState } from 'react'
import './ProductoAcordeon.css'

const SECCIONES = [
  {
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M9 12l2 2l4 -4"/>
        <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"/>
      </svg>
    ),
    titulo: '¿Cómo certificamos nuestros equipos?',
    contenido: (
      <div className="acordeon-cuerpo-certificacion">
        <p>En MatCell cada equipo pasa por un riguroso proceso de verificación antes de llegar a tus manos:</p>
        <ul>
          <li><strong>Revisión de IMEI:</strong> Verificamos que el IMEI no esté reportado como robado ni bloqueado en ninguna operadora.</li>
          <li><strong>Diagnóstico técnico completo:</strong> Probamos pantalla, batería, cámaras, conectores, altavoces, micrófono, sensores y conectividad (WiFi, Bluetooth, señal).</li>
          <li><strong>Inspección estética:</strong> Clasificamos el estado físico del equipo y lo describimos con honestidad en la ficha de producto.</li>
          <li><strong>Limpieza y formateo:</strong> El equipo llega limpio, sin datos de propietarios anteriores y listo para usarse.</li>
          <li><strong>Control de calidad final:</strong> Un segundo técnico revisa el equipo antes de empacarlo para el envío.</li>
        </ul>
        <p>Nos especializamos en celulares reacondicionados de alta gama. Nuestro objetivo es que recibas un equipo que funcione como nuevo, a una fracción del precio.</p>
      </div>
    ),
  },
  {
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
        <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
        <path d="M5 17h-2v-4m-1 -8h11v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"/>
        <path d="M3 9l4 0"/>
      </svg>
    ),
    titulo: 'Envíos',
    contenido: (
      <div className="acordeon-cuerpo-envios">
        <div className="acordeon-despacho-box">
          <span className="acordeon-despacho-icono">🚀</span>
          <div>
            <p className="acordeon-despacho-titulo">Despacho en 24–48 horas hábiles</p>
            <p className="acordeon-despacho-sub">Una vez confirmado tu pago, preparamos y enviamos tu pedido en 1 a 2 días hábiles.</p>
          </div>
        </div>
        <ul>
          <li><strong>Envío a todo Colombia</strong> a través de nuestras transportadoras aliadas.</li>
          <li><strong>Tiempo de entrega:</strong> entre 2 y 5 días hábiles según tu ciudad.</li>
          <li><strong>Seguimiento en tiempo real:</strong> Te enviamos el número de guía para que puedas rastrear tu pedido.</li>
          <li><strong>Empaque seguro:</strong> Cada equipo va protegido para evitar cualquier daño durante el transporte.</li>
          <li><strong>Contraentrega disponible</strong> en ciudades principales (sujeto a disponibilidad).</li>
        </ul>
      </div>
    ),
  },
  {
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.09 7.06"/>
        <path d="M15 19l2 2l4 -4"/>
      </svg>
    ),
    titulo: 'Garantía',
    contenido: (
      <div className="acordeon-cuerpo-garantia">
        <div className="acordeon-garantia-cards">
          <div className="acordeon-garantia-card">
            <div className="acordeon-garantia-card-titulo">🛡️ Garantía de funcionamiento</div>
            <p><strong>3 meses</strong> de garantía contra fallas de fábrica en todos nuestros equipos reacondicionados.</p>
            <p>Si el equipo presenta fallas técnicas no relacionadas con daños físicos o por agua, lo reparamos o reemplazamos sin costo adicional.</p>
          </div>
          <div className="acordeon-garantia-card">
            <div className="acordeon-garantia-card-titulo">📦 Garantía de satisfacción</div>
            <p><strong>3 días</strong> para reportar cualquier inconformidad desde que recibes el equipo.</p>
            <p>Si el producto no coincide con lo descrito, gestionamos un cambio o devolución sin problema.</p>
          </div>
        </div>
        <p className="acordeon-garantia-nota">⚠️ La garantía no cubre daños físicos, daños por líquidos, intervención por terceros o mal uso del equipo.</p>
      </div>
    ),
  },
  {
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/>
        <path d="M12 9h.01"/>
        <path d="M11 12h1v4h1"/>
      </svg>
    ),
    titulo: 'Preguntas frecuentes',
    contenido: (
      <div className="acordeon-cuerpo-faq">
        {[
          {
            p: '¿Los equipos vienen con cargador?',
            r: 'No incluimos cargador por defecto. Solo el equipo. Puedes agregar un cargador compatible desde nuestra tienda.',
          },
          {
            p: '¿Puedo pagar en cuotas?',
            r: 'Sí, a través de Wompi puedes pagar con tarjeta de crédito y acceder a las cuotas que ofrece tu banco.',
          },
          {
            p: '¿Los equipos están liberados?',
            r: 'Sí, todos nuestros equipos están liberados para cualquier operadora nacional e internacional.',
          },
          {
            p: '¿Qué significa que sea reacondicionado?',
            r: 'Es un equipo usado que pasó por revisión técnica, limpieza y ajuste para funcionar como nuevo. No es de caja, pero tiene el mismo rendimiento a un precio mucho menor.',
          },
          {
            p: '¿Puedo devolver el equipo si no me gusta?',
            r: 'Tienes 3 días desde que lo recibes para reportar cualquier inconformidad. Si el equipo no coincide con lo descrito, hacemos el cambio.',
          },
          {
            p: '¿Hacen envíos a toda Colombia?',
            r: 'Sí, enviamos a todo el país. El tiempo de entrega varía entre 2 y 5 días hábiles según tu ciudad.',
          },
          {
            p: '¿Cómo sé que mi pago es seguro?',
            r: 'Procesamos todos los pagos con tarjeta a través de Wompi, una plataforma certificada PCI-DSS que garantiza la seguridad de tu información.',
          },
          {
            p: '¿Puedo pagar contraentrega?',
            r: 'Sí, en ciudades principales disponemos de la opción de pago contraentrega. Podrás ver si está disponible para tu ciudad al completar tu dirección en el checkout.',
          },
        ].map(({ p, r }, i, arr) => (
          <div key={i} className={`acordeon-faq-item${i < arr.length - 1 ? ' acordeon-faq-item--sep' : ''}`}>
            <p className="acordeon-faq-pregunta">{p}</p>
            <p className="acordeon-faq-respuesta">{r}</p>
          </div>
        ))}
      </div>
    ),
  },
]

export default function ProductoAcordeon() {
  const [abierto, setAbierto] = useState(null)

  return (
    <div className="producto-acordeon-wrap">
      <div className="producto-acordeon">
        {SECCIONES.map((sec, i) => {
          const estaAbierto = abierto === i
          return (
            <div key={i} className={`acordeon-item${estaAbierto ? ' acordeon-item--abierto' : ''}${i < SECCIONES.length - 1 ? ' acordeon-item--sep' : ''}`}>
              <button
                className="acordeon-cabecera"
                onClick={() => setAbierto(estaAbierto ? null : i)}
                aria-expanded={estaAbierto}
              >
                <span className="acordeon-icono">{sec.icono}</span>
                <span className="acordeon-titulo">{sec.titulo}</span>
                <svg
                  className={`acordeon-flecha${estaAbierto ? ' acordeon-flecha--abierto' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6l6 -6"/>
                </svg>
              </button>
              {estaAbierto && (
                <div className="acordeon-contenido">
                  {sec.contenido}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
