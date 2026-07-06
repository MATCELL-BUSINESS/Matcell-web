import { useEffect, useRef, useState } from 'react'
import { useTiendaConfig } from '../context/TiendaConfigContext'
import { FaWhatsapp } from 'react-icons/fa'
import './Politicas.css'

const SECCIONES = [
  { id: 'garantia',   icono: '🛡️', nombre: 'Garantía' },
  { id: 'envios',     icono: '🚚', nombre: 'Envíos' },
  { id: 'terminos',   icono: '📄', nombre: 'Términos y condiciones' },
  { id: 'privacidad', icono: '🔒', nombre: 'Privacidad' },
  { id: 'cambios',    icono: '🔄', nombre: 'Cambios y devoluciones' },
]

export default function Politicas() {
  const { whatsapp } = useTiendaConfig()
  const [activa, setActiva] = useState('garantia')
  const observerRef = useRef(null)

  useEffect(() => {
    const els = SECCIONES.map(({ id }) => document.getElementById(id)).filter(Boolean)
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiva(entry.target.id)
        })
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )
    els.forEach((el) => observerRef.current.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

  const scrollA = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, tengo una pregunta sobre las políticas de MatCell.')}`

  return (
    <div className="politicas-page">

      {/* Header */}
      <header className="pol-header">
        <h1>Políticas de MatCell</h1>
        <p>Transparencia y confianza en cada compra.</p>
      </header>

      {/* Tabs móvil */}
      <nav className="pol-tabs">
        {SECCIONES.map(({ id, icono, nombre }) => (
          <button
            key={id}
            className={`pol-tab ${activa === id ? 'active' : ''}`}
            onClick={() => scrollA(id)}
          >
            {icono} {nombre}
          </button>
        ))}
      </nav>

      {/* Layout */}
      <div className="pol-layout">

        {/* Sidebar desktop */}
        <aside className="pol-sidebar">
          <nav>
            {SECCIONES.map(({ id, icono, nombre }) => (
              <button
                key={id}
                className={`pol-nav-item ${activa === id ? 'active' : ''}`}
                onClick={() => scrollA(id)}
              >
                <span className="pol-nav-icono">{icono}</span>
                <span>{nombre}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="pol-content">

          {/* ── GARANTÍA ── */}
          <section id="garantia" className="pol-seccion">
            <h2>🛡️ Garantía</h2>
            <p className="pol-intro">
              En MatCell nos comprometemos con la calidad de cada producto que vendemos. Todos nuestros equipos son verificados antes del despacho y cuentan con garantía respaldada.
            </p>

            <div className="pol-cards-row">
              <div className="pol-card-tipo">
                <div className="pol-card-icon">📦</div>
                <h3>Dispositivos nuevos</h3>
                <p>Garantía de <strong>12 meses</strong> directamente con centros de servicio oficial del fabricante (como Mac Center para equipos Apple). Cubre defectos de fábrica y fallas funcionales bajo uso normal.</p>
              </div>
              <div className="pol-card-tipo">
                <div className="pol-card-icon">🔁</div>
                <h3>Dispositivos seminuevos</h3>
                <p>Garantía de <strong>3 meses</strong> otorgada por MatCell, contados desde la fecha de entrega. Cubre exclusivamente fallas funcionales verificables.</p>
              </div>
            </div>

            <h3 className="pol-subtitle">¿Qué cubre la garantía?</h3>
            <ul className="pol-list">
              <li>✅ Fallas en el funcionamiento sin causa externa aparente.</li>
              <li>✅ Defectos de fabricación no visibles al momento de la compra.</li>
              <li>✅ Problemas con componentes internos bajo uso normal.</li>
            </ul>

            <div className="pol-card-warning">
              <h3>❌ ¿Qué NO cubre la garantía?</h3>
              <ul className="pol-list">
                <li>❌ Daños por caídas, golpes o impactos físicos.</li>
                <li>❌ Daños por contacto con líquidos o humedad.</li>
                <li>❌ Equipos con IMEI duplicado o alterado.</li>
                <li>❌ Bloqueo por reporte de no registro ante operadores móviles.</li>
                <li>❌ Bloqueo por iCloud, cuenta de Google u otras cuentas activas.</li>
                <li>❌ Disminución natural de la batería (desgaste normal de uso).</li>
                <li>❌ Daños por cargadores, accesorios o software no originales.</li>
                <li>❌ Equipos con evidencia de apertura o reparación no autorizada.</li>
                <li>❌ Garantía vencida (fuera del plazo según tipo de equipo).</li>
                <li>❌ Pérdida o robo del equipo.</li>
              </ul>
            </div>

            <h3 className="pol-subtitle">¿Cómo hacer válida la garantía?</h3>
            <ol className="pol-steps">
              <li><span className="pol-step-num">1</span>Contáctanos por WhatsApp antes de enviar el equipo.</li>
              <li><span className="pol-step-num">2</span>Describe el problema con fotos o videos que lo evidencien.</li>
              <li><span className="pol-step-num">3</span>Si la falla es cubierta, te indicamos el proceso de envío o recogida según tu ubicación.</li>
              <li><span className="pol-step-num">4</span>El equipo es revisado por nuestro equipo técnico. Si se confirma la falla, procedemos con reparación o cambio.</li>
            </ol>

            <div className="pol-card-nota">
              MatCell se reserva el derecho de verificar las condiciones del equipo antes de hacer válida cualquier garantía. Equipos con evidencia de manipulación externa no serán admitidos bajo garantía. El tiempo de respuesta y resolución será de mínimo <strong>5 días hábiles</strong>, contados desde la recepción del equipo.
            </div>
          </section>

          {/* ── ENVÍOS ── */}
          <section id="envios" className="pol-seccion">
            <h2>🚚 Envíos</h2>

            <div className="pol-bloque">
              <h3>⏱️ Procesamiento de pedidos</h3>
              <p>Los pedidos con pago confirmado son procesados en un plazo máximo de <strong>24 horas hábiles</strong>. El despacho se realiza dentro de las <strong>48 horas</strong> siguientes al procesamiento (no incluye fines de semana ni festivos). En temporadas de alta demanda (promociones especiales), este plazo podría extenderse.</p>
            </div>

            <h3 className="pol-subtitle">Modalidades de envío</h3>
            <div className="pol-cards-row">
              <div className="pol-card-tipo">
                <div className="pol-card-icon">🏪</div>
                <h3>Recogida en local</h3>
                <p>Gratis. Disponible en nuestro punto físico en <strong>Ciénaga, Magdalena</strong>. Tiempo: mismo día o siguiente día hábil tras confirmar el pedido.</p>
              </div>
              <div className="pol-card-tipo">
                <div className="pol-card-icon">📦</div>
                <h3>Envío nacional</h3>
                <p>A todo el territorio colombiano. Tiempo estimado: <strong>3 a 7 días hábiles</strong> según la ubicación de destino. Costo calculado en el checkout. Envío gratis superando el monto mínimo de la tienda.</p>
              </div>
            </div>

            <h3 className="pol-subtitle">Plazos de entrega estimados</h3>
            <div className="pol-table-wrap">
              <table className="pol-table">
                <thead>
                  <tr><th>Destino</th><th>Tiempo estimado</th></tr>
                </thead>
                <tbody>
                  <tr><td>Ciudades principales</td><td>3 a 5 días hábiles</td></tr>
                  <tr><td>Otras localidades</td><td>5 a 7 días hábiles</td></tr>
                  <tr><td>Ciénaga (recogida local)</td><td>Mismo día o siguiente día hábil</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="pol-subtitle">Seguimiento del pedido</h3>
            <ul className="pol-list">
              <li>✅ Recibirás un número de guía una vez despachado el pedido.</li>
              <li>✅ Te notificamos por WhatsApp cuando el paquete esté en camino.</li>
              <li>✅ Puedes rastrear tu pedido en tiempo real con el número de guía proporcionado.</li>
            </ul>

            <div className="pol-card-blue">
              <strong>📍 Dirección de entrega</strong><br /><br />
              Es responsabilidad del cliente registrar una dirección completa y correcta (nombre, barrio, torre/apto, referencias). Si la dirección es incorrecta o incompleta y el pedido es devuelto o se pierde, el cliente asumirá los costos de reenvío.
            </div>

            <div className="pol-card-alert">
              <strong>⚠️ Retrasos en el envío:</strong> MatCell no se hace responsable por retrasos ocasionados por la transportadora, condiciones climáticas adversas, cierres viales u otros factores fuera de nuestro control. Haremos todo lo posible por gestionar cualquier inconveniente.
            </div>

            <h3 className="pol-subtitle">¿Paquete dañado o incorrecto?</h3>
            <p style={{ color: '#555', marginBottom: '16px', fontSize: '0.95rem' }}>Si recibes un paquete visiblemente dañado:</p>
            <ol className="pol-steps">
              <li><span className="pol-step-num">1</span>No firmes la recepción si el daño es evidente.</li>
              <li><span className="pol-step-num">2</span>Toma fotos o video del paquete antes de abrirlo.</li>
              <li><span className="pol-step-num">3</span>Contáctanos de inmediato por WhatsApp con la evidencia.</li>
            </ol>
            <p className="pol-nota-final">Si el producto llegó incorrecto o con daño atribuible al transporte, MatCell gestionará la solución sin costo para el cliente.</p>
          </section>

          {/* ── TÉRMINOS Y CONDICIONES ── */}
          <section id="terminos" className="pol-seccion">
            <h2>📄 Términos y condiciones</h2>

            <div className="pol-bloque">
              <h3>1. Aceptación de los términos</h3>
              <p>Al acceder, navegar y realizar compras en MatCell, el usuario acepta de manera expresa estos Términos y Condiciones.</p>
            </div>

            <div className="pol-bloque">
              <h3>2. Capacidad legal</h3>
              <p>El usuario declara ser mayor de edad y contar con la capacidad legal necesaria para celebrar contratos y realizar compras a través de este sitio.</p>
            </div>

            <div className="pol-bloque">
              <h3>3. Sobre los productos</h3>
              <ul className="pol-list">
                <li>Todos los productos están claramente clasificados como <strong>nuevos</strong> o <strong>seminuevos</strong>.</li>
                <li>Las fotos y descripciones son representativas. En equipos seminuevos puede haber diferencias estéticas mínimas (microrayones) que no afectan el funcionamiento y son inherentes al estado del equipo.</li>
                <li>MatCell verifica el funcionamiento de cada equipo antes de publicarlo y despacharlo.</li>
              </ul>
            </div>

            <div className="pol-bloque">
              <h3>4. Precios y formas de pago</h3>
              <ul className="pol-list">
                <li>Los precios están en pesos colombianos (COP) e incluyen los impuestos aplicables salvo que se indique lo contrario.</li>
                <li>MatCell se reserva el derecho de modificar precios sin previo aviso. El precio válido es el del momento de confirmar el pedido — los precios no se modifican en pedidos ya confirmados.</li>
                <li>Los pagos se procesan a través de <strong>Wompi</strong>, pasarela de pago segura y certificada en Colombia. MatCell no almacena datos de tarjetas ni información financiera.</li>
                <li>El pedido se confirma solo cuando el pago es aprobado. Pagos pendientes o fallidos no generan reserva de inventario.</li>
              </ul>
            </div>

            <div className="pol-bloque">
              <h3>5. Disponibilidad de productos</h3>
              <ul className="pol-list">
                <li>El inventario es limitado y puede cambiar sin previo aviso.</li>
                <li>Si un producto comprado no está disponible, contactaremos al cliente para ofrecer un equivalente o el reembolso total.</li>
              </ul>
            </div>

            <div className="pol-bloque">
              <h3>6. Envíos y entregas</h3>
              <p>Los tiempos, costos y condiciones de envío se rigen por la Política de Envíos publicada en este mismo documento.</p>
            </div>

            <div className="pol-bloque">
              <h3>7. Garantías</h3>
              <p>Las garantías se rigen por la Política de Garantía publicada en este mismo documento. El cliente acepta las condiciones, exclusiones y procedimientos allí establecidos.</p>
            </div>

            <div className="pol-bloque">
              <h3>8. Cambios, reembolsos y créditos</h3>
              <p>Los cambios y devoluciones se rigen por la Política de Cambios y Devoluciones publicada en este mismo documento.</p>
            </div>

            <div className="pol-bloque">
              <h3>9. Responsabilidad limitada</h3>
              <p>MatCell no será responsable por daños indirectos, pérdidas de datos, retrasos por causas ajenas a su control, o perjuicios derivados del uso indebido de los productos adquiridos.</p>
            </div>

            <div className="pol-bloque">
              <h3>10. Uso del sitio web</h3>
              <p>El usuario se compromete a utilizar el sitio de forma lícita, absteniéndose de actos que afecten la seguridad, funcionamiento o integridad del sitio o de terceros.</p>
            </div>

            <div className="pol-bloque">
              <h3>11. Propiedad intelectual</h3>
              <p>Todo el contenido del sitio (textos, imágenes, logotipos, diseños) es propiedad de MatCell y está protegido por las leyes de propiedad intelectual. Queda prohibida su reproducción o uso sin autorización previa.</p>
            </div>

            <div className="pol-bloque">
              <h3>12. Protección de datos personales</h3>
              <p>El tratamiento de datos personales se realiza conforme a la Política de Privacidad publicada en este documento, la cual el usuario declara conocer y aceptar.</p>
            </div>

            <div className="pol-bloque">
              <h3>13. Modificaciones de los términos</h3>
              <p>MatCell se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en el sitio.</p>
            </div>

            <div className="pol-bloque">
              <h3>14. Legislación aplicable</h3>
              <p>Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia será sometida a la jurisdicción de los tribunales competentes del país.</p>
            </div>
          </section>

          {/* ── PRIVACIDAD ── */}
          <section id="privacidad" className="pol-seccion">
            <h2>🔒 Privacidad</h2>

            <div className="pol-bloque">
              <h3>1. Introducción</h3>
              <p>En MatCell valoramos y respetamos tu privacidad. Esta política detalla cómo recopilamos, usamos, almacenamos y protegemos tu información personal, en cumplimiento de la <strong>Ley 1581 de 2012</strong> y el <strong>Decreto 1377 de 2013</strong> sobre protección de datos personales en Colombia.</p>
            </div>

            <div className="pol-bloque">
              <h3>2. Información que recopilamos</h3>
              <ul className="pol-list">
                <li>👤 Nombre completo</li>
                <li>📱 Número de teléfono</li>
                <li>📧 Correo electrónico</li>
                <li>📍 Dirección de entrega</li>
                <li>💳 Información de compra (historial de pedidos — nunca datos de tarjeta)</li>
                <li>🌐 Datos de navegación (IP, tipo de navegador, páginas visitadas, cookies)</li>
              </ul>
            </div>

            <div className="pol-bloque">
              <h3>3. Uso de la información</h3>
              <ul className="pol-list">
                <li>✅ Procesar y gestionar tus pedidos.</li>
                <li>✅ Enviarte confirmaciones y actualizaciones sobre tu compra.</li>
                <li>✅ Contactarte en caso de novedades con tu pedido.</li>
                <li>✅ Mejorar la experiencia de navegación y nuestros servicios.</li>
                <li>✅ Realizar estudios de mercado internos.</li>
                <li>✅ Enviarte información sobre promociones y novedades (solo si lo autorizas).</li>
              </ul>
            </div>

            <div className="pol-card-green">
              <strong>🔒 Compartición de datos</strong><br /><br />
              MatCell <strong>no vende ni comparte</strong> tu información personal con terceros, salvo cuando es estrictamente necesario para:
              <ul className="pol-list" style={{ marginTop: '10px' }}>
                <li>• Procesar tu pedido (transportadoras, pasarela de pagos Wompi).</li>
                <li>• Cumplir requerimientos legales exigidos por autoridades competentes.</li>
              </ul>
            </div>

            <div className="pol-bloque">
              <h3>5. Seguridad de la información</h3>
              <p>Utilizamos servicios con altos estándares de seguridad (Supabase, Vercel, Wompi) con cifrado de datos en tránsito y en reposo. Sin embargo, ningún método de transmisión por internet es completamente seguro — tomamos todas las medidas razonables para proteger tu información.</p>
            </div>

            <div className="pol-bloque">
              <h3>6. Tus derechos</h3>
              <p style={{ marginBottom: '12px', color: '#555' }}>Como titular de tus datos personales tienes derecho a:</p>
              <ul className="pol-list">
                <li>📋 <strong>Conocer</strong> qué información tenemos sobre ti.</li>
                <li>✏️ <strong>Rectificar</strong> datos incorrectos o incompletos.</li>
                <li>🗑️ <strong>Solicitar la eliminación</strong> de tus datos, sujeto a excepciones legales.</li>
                <li>❌ <strong>Oponerte</strong> al tratamiento de tus datos para determinados fines.</li>
                <li>🔒 <strong>Revocar</strong> la autorización para el uso de tus datos.</li>
              </ul>
              <p style={{ marginTop: '12px', color: '#555' }}>Para ejercer estos derechos: <strong>matcellhq29@gmail.com</strong> o por WhatsApp.</p>
            </div>

            <div className="pol-bloque">
              <h3>7. Cookies</h3>
              <p>Nuestro sitio usa cookies para mejorar la experiencia de navegación. Puedes configurar tu navegador para rechazarlas, aunque esto puede afectar algunas funcionalidades.</p>
            </div>

            <div className="pol-bloque">
              <h3>8. Cambios en la política</h3>
              <p>Podemos actualizar esta política en cualquier momento para reflejar cambios en nuestras prácticas o requisitos legales. Las modificaciones entrarán en vigor inmediatamente después de su publicación.</p>
            </div>
          </section>

          {/* ── CAMBIOS Y DEVOLUCIONES ── */}
          <section id="cambios" className="pol-seccion">
            <h2>🔄 Cambios y devoluciones</h2>
            <p className="pol-intro">
              En MatCell queremos que estés completamente satisfecho con tu compra. A continuación encontrarás las condiciones para solicitar cambios o devoluciones.
            </p>

            <div className="pol-bloque">
              <h3>1. Cambios en dispositivos seminuevos</h3>
              <p>MatCell acepta cambios en dispositivos seminuevos <strong>únicamente por fallas funcionales verificadas</strong> dentro del período de garantía (3 meses desde la fecha de entrega).</p>
            </div>

            <h3 className="pol-subtitle">2. ¿Cómo solicitar un cambio?</h3>
            <ol className="pol-steps">
              <li><span className="pol-step-num">1</span>Contáctanos por WhatsApp dentro del período de garantía.</li>
              <li><span className="pol-step-num">2</span>Describe la falla con evidencia en foto o video.</li>
              <li><span className="pol-step-num">3</span>Nuestro equipo evaluará el caso en un plazo de hasta 5 días hábiles.</li>
              <li><span className="pol-step-num">4</span>Si la falla es verificada y cubierta, procedemos con el cambio por un equipo de iguales o superiores características, sujeto a disponibilidad.</li>
            </ol>

            <div className="pol-card-warning">
              <h3>❌ Casos en los que NO aplica el cambio</h3>
              <ul className="pol-list">
                <li>❌ Disminución de la batería (desgaste natural de uso).</li>
                <li>❌ Bloqueo por reporte de no registro ante operadores móviles.</li>
                <li>❌ Bloqueo por iCloud o cuenta de Google activa.</li>
                <li>❌ Daños por caídas, golpes o impactos físicos.</li>
                <li>❌ Daños por contacto con agua o líquidos.</li>
                <li>❌ IMEI duplicado o con reporte negativo en bases de datos.</li>
                <li>❌ Garantía vencida (fuera de los 3 meses).</li>
                <li>❌ Equipos con evidencia de apertura o reparación no autorizada.</li>
                <li>❌ Inconformidad estética (rayones, marcas de uso visibles).</li>
                <li>❌ Cambio de opinión o arrepentimiento de compra.</li>
              </ul>
            </div>

            <div className="pol-card-blue">
              <strong>💙 Devoluciones en dinero</strong><br /><br />
              MatCell realiza reembolsos en dinero <strong>únicamente</strong> en estos casos excepcionales:
              <ul className="pol-list" style={{ marginTop: '10px' }}>
                <li>• El producto enviado no corresponde al pedido realizado.</li>
                <li>• El producto llegó con daño atribuible al transporte y no hay stock disponible para reposición.</li>
                <li>• El producto comprado no está disponible en inventario después de confirmado el pago.</li>
              </ul>
              <p style={{ marginTop: '12px' }}>El reembolso se realizará por el mismo medio de pago utilizado, en un plazo máximo de <strong>5 días hábiles</strong> tras verificar la situación.</p>
            </div>

            <div className="pol-bloque" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
              <h3>5. Modificaciones a esta política</h3>
              <p>MatCell se reserva el derecho de modificar esta política en cualquier momento. Las modificaciones entrarán en vigor desde su publicación. Los reclamos se regirán por la política vigente al momento de la compra.</p>
            </div>
          </section>

        </main>
      </div>

      {/* Contacto final */}
      <section className="pol-contacto">
        <h2>¿Tienes alguna duda?</h2>
        <p>Estamos aquí para ayudarte.</p>
        <a href={waHref} target="_blank" rel="noopener noreferrer" className="pol-wa-btn">
          <FaWhatsapp size={20} />
          Escríbenos por WhatsApp
        </a>
        <p className="pol-contacto-sub">matcellhq29@gmail.com · Ciénaga, Magdalena, Colombia</p>
        <p className="pol-contacto-fecha">Última actualización: julio 2026</p>
      </section>

    </div>
  )
}
