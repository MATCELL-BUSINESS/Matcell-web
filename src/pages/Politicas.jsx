import { useEffect, useRef, useState } from 'react'
import { useTiendaConfig } from '../context/TiendaConfigContext'
import { FaWhatsapp } from 'react-icons/fa'
import './Politicas.css'

const SECCIONES = [
  { id: 'garantia',  icono: '🛡️', nombre: 'Garantía' },
  { id: 'envios',    icono: '🚚', nombre: 'Envíos' },
  { id: 'terminos',  icono: '📄', nombre: 'Términos y condiciones' },
  { id: 'privacidad',icono: '🔒', nombre: 'Privacidad' },
  { id: 'cambios',   icono: '🔄', nombre: 'Cambios y devoluciones' },
]

export default function Politicas() {
  const { whatsapp } = useTiendaConfig()
  const [activa, setActiva] = useState('garantia')
  const observerRef = useRef(null)

  useEffect(() => {
    const secciones = SECCIONES.map(({ id }) => document.getElementById(id)).filter(Boolean)
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiva(entry.target.id)
        })
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )
    secciones.forEach((el) => observerRef.current.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

  const scrollA = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const whatsappHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, tengo una pregunta sobre las políticas de MatCell.')}`

  return (
    <div className="politicas-page">

      {/* ── Header ───────────────────────── */}
      <header className="pol-header">
        <h1>Políticas de MatCell</h1>
        <p>Transparencia y confianza en cada compra.</p>
      </header>

      {/* ── Tabs móvil ───────────────────── */}
      <nav className="pol-tabs">
        {SECCIONES.map(({ id, icono, nombre }) => (
          <button
            key={id}
            className={`pol-tab ${activa === id ? 'active' : ''}`}
            onClick={() => scrollA(id)}
          >
            <span>{icono}</span> {nombre}
          </button>
        ))}
      </nav>

      {/* ── Layout principal ─────────────── */}
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

        {/* Contenido */}
        <main className="pol-content">

          {/* ── Garantía ─────────────────── */}
          <section id="garantia" className="pol-seccion">
            <h2>🛡️ Garantía</h2>
            <p className="pol-intro">En MatCell nos comprometemos con la calidad de cada producto que vendemos. Todos nuestros equipos cuentan con garantía respaldada.</p>

            <div className="pol-cards-row">
              <div className="pol-card-garantia">
                <div className="pol-card-icon">📦</div>
                <h3>Dispositivos nuevos</h3>
                <p>Garantía de <strong>12 meses</strong> directamente con centros de servicio oficial del fabricante (como Mac Center para equipos Apple). Cubre defectos de fábrica y fallas funcionales bajo uso normal.</p>
              </div>
              <div className="pol-card-garantia">
                <div className="pol-card-icon">🔁</div>
                <h3>Dispositivos seminuevos</h3>
                <p>Garantía de <strong>3 meses</strong> otorgada directamente por MatCell, contados desde la fecha de entrega. Cubre exclusivamente fallas funcionales verificables.</p>
              </div>
            </div>

            <h3 className="pol-subtitle">¿Qué cubre la garantía?</h3>
            <ul className="pol-list">
              <li>✅ Fallas en el funcionamiento del equipo sin causa externa aparente.</li>
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
                <li>❌ Disminución natural de la batería (desgaste normal).</li>
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
              <li><span className="pol-step-num">3</span>Si la falla es cubierta, te indicamos el proceso de envío o recogida.</li>
              <li><span className="pol-step-num">4</span>El equipo será revisado. Si se confirma la falla, procedemos con reparación o cambio.</li>
            </ol>
          </section>

          {/* ── Envíos ───────────────────── */}
          <section id="envios" className="pol-seccion">
            <h2>🚚 Envíos</h2>

            <div className="pol-cards-row">
              <div className="pol-card-garantia">
                <div className="pol-card-icon">🏪</div>
                <h3>Recogida en local</h3>
                <p>Gratis. Disponible en nuestro punto en <strong>Ciénaga, Magdalena</strong>. Mismo día o siguiente día hábil.</p>
              </div>
              <div className="pol-card-garantia">
                <div className="pol-card-icon">📦</div>
                <h3>Envío nacional</h3>
                <p>A todo Colombia. Tiempo estimado: <strong>3 a 7 días hábiles</strong>. Costo calculado en el checkout según destino. Envío gratis superando el monto mínimo de la tienda.</p>
              </div>
            </div>

            <h3 className="pol-subtitle">Tiempos de entrega</h3>
            <div className="pol-table-wrap">
              <table className="pol-table">
                <thead>
                  <tr><th>Modalidad</th><th>Tiempo estimado</th><th>Costo</th></tr>
                </thead>
                <tbody>
                  <tr><td>Recogida en Ciénaga</td><td>Mismo día o siguiente día hábil</td><td>Gratis</td></tr>
                  <tr><td>Envío nacional</td><td>3 a 7 días hábiles</td><td>Según destino</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="pol-subtitle">Proceso de despacho</h3>
            <ul className="pol-list">
              <li>✅ Pedidos con pago confirmado se despachan en máximo 1 día hábil.</li>
              <li>✅ Recibirás número de guía para rastrear tu pedido.</li>
              <li>✅ Te notificamos por WhatsApp cuando tu pedido esté en camino.</li>
            </ul>

            <div className="pol-card-alert">
              <strong>⚠️ Nota importante:</strong> Los tiempos son estimados y pueden variar por festivos, condiciones de la transportadora o situaciones fuera de nuestro control. MatCell no se responsabiliza por demoras una vez el paquete es entregado a la transportadora.
            </div>

            <h3 className="pol-subtitle">¿Paquete dañado o incorrecto?</h3>
            <ol className="pol-steps">
              <li><span className="pol-step-num">1</span>No firmes la recepción si el daño es evidente.</li>
              <li><span className="pol-step-num">2</span>Toma fotos o video del paquete antes de abrirlo.</li>
              <li><span className="pol-step-num">3</span>Contáctanos de inmediato por WhatsApp con la evidencia.</li>
            </ol>
          </section>

          {/* ── Términos ─────────────────── */}
          <section id="terminos" className="pol-seccion">
            <h2>📄 Términos y condiciones</h2>

            <div className="pol-bloque">
              <h3>📱 Sobre los productos</h3>
              <ul className="pol-list">
                <li>Todos los productos están claramente clasificados como nuevos o seminuevos.</li>
                <li>En equipos seminuevos puede haber diferencias estéticas mínimas (microrayones) que no afectan el funcionamiento.</li>
                <li>MatCell verifica el funcionamiento de cada equipo antes de publicarlo y despacharlo.</li>
              </ul>
            </div>

            <div className="pol-bloque">
              <h3>💰 Sobre los precios</h3>
              <ul className="pol-list">
                <li>Los precios están en pesos colombianos (COP).</li>
                <li>MatCell puede modificar precios sin previo aviso. El precio válido es el del momento de confirmar el pedido.</li>
              </ul>
            </div>

            <div className="pol-bloque">
              <h3>💳 Sobre los pagos</h3>
              <ul className="pol-list">
                <li>Los pagos se procesan a través de Wompi, pasarela certificada en Colombia.</li>
                <li>MatCell no almacena datos de tarjetas ni información financiera.</li>
                <li>El pedido se confirma solo cuando el pago es aprobado. Pagos fallidos no reservan inventario.</li>
              </ul>
            </div>

            <div className="pol-bloque">
              <h3>📦 Sobre la disponibilidad</h3>
              <ul className="pol-list">
                <li>El inventario es limitado y puede cambiar sin previo aviso.</li>
                <li>Si un producto comprado no está disponible, ofrecemos un equivalente o reembolso total.</li>
              </ul>
            </div>
          </section>

          {/* ── Privacidad ───────────────── */}
          <section id="privacidad" className="pol-seccion">
            <h2>🔒 Privacidad</h2>
            <p className="pol-intro">En MatCell protegemos tu información personal en cumplimiento de la <strong>Ley 1581 de 2012</strong> y el <strong>Decreto 1377 de 2013</strong> sobre protección de datos personales en Colombia.</p>

            <h3 className="pol-subtitle">¿Qué información recopilamos?</h3>
            <ul className="pol-list">
              <li>👤 Nombre completo</li>
              <li>📱 Número de teléfono</li>
              <li>📧 Correo electrónico</li>
              <li>📍 Dirección de entrega</li>
              <li>🌐 Información de navegación (cookies)</li>
            </ul>

            <h3 className="pol-subtitle">¿Para qué usamos tu información?</h3>
            <ul className="pol-list">
              <li>✅ Procesar y gestionar tus pedidos.</li>
              <li>✅ Enviarte actualizaciones sobre el estado de tu compra.</li>
              <li>✅ Contactarte en caso de novedades con tu pedido.</li>
              <li>✅ Mejorar la experiencia de navegación.</li>
              <li>✅ Enviarte promociones (solo si lo autorizas).</li>
            </ul>

            <div className="pol-card-green">
              MatCell <strong>no vende ni comparte</strong> tu información personal con terceros, salvo cuando es estrictamente necesario para procesar tu pedido (transportadoras, pasarela de pagos) o cuando lo exija la ley.
            </div>

            <h3 className="pol-subtitle">Tus derechos</h3>
            <ul className="pol-list">
              <li>📋 <strong>Conocer</strong> qué información tenemos sobre ti.</li>
              <li>✏️ <strong>Actualizar</strong> o corregir tus datos.</li>
              <li>🗑️ <strong>Solicitar la eliminación</strong> de tus datos.</li>
              <li>❌ <strong>Revocar</strong> la autorización para el uso de tus datos.</li>
            </ul>
            <p>Para ejercer estos derechos: <strong>matcellhq29@gmail.com</strong> o por WhatsApp.</p>
          </section>

          {/* ── Cambios y devoluciones ───── */}
          <section id="cambios" className="pol-seccion">
            <h2>🔄 Cambios y devoluciones</h2>
            <p className="pol-intro">MatCell acepta cambios en dispositivos seminuevos únicamente por fallas funcionales verificadas dentro del período de garantía.</p>

            <h3 className="pol-subtitle">¿Cómo solicitar un cambio?</h3>
            <ol className="pol-steps">
              <li><span className="pol-step-num">1</span>Contáctanos por WhatsApp dentro del período de garantía (3 meses).</li>
              <li><span className="pol-step-num">2</span>Describe la falla con evidencia en foto o video.</li>
              <li><span className="pol-step-num">3</span>Nuestro equipo evaluará el caso.</li>
              <li><span className="pol-step-num">4</span>Si la falla es verificada y cubierta, procedemos con el cambio por equipo de iguales o superiores características, sujeto a disponibilidad.</li>
            </ol>

            <div className="pol-card-warning">
              <h3>❌ Casos en los que NO aplica el cambio</h3>
              <ul className="pol-list">
                <li>❌ Disminución de la batería (desgaste natural).</li>
                <li>❌ Bloqueo por reporte de no registro ante operadores móviles.</li>
                <li>❌ Bloqueo por iCloud o cuenta de Google activa.</li>
                <li>❌ Daños por caídas, golpes o impactos.</li>
                <li>❌ Daños por contacto con agua o líquidos.</li>
                <li>❌ IMEI duplicado o con reporte negativo.</li>
                <li>❌ Garantía vencida (fuera de los 3 meses).</li>
                <li>❌ Equipos con evidencia de apertura no autorizada.</li>
                <li>❌ Inconformidad estética (rayones, marcas de uso).</li>
                <li>❌ Cambio de opinión o arrepentimiento de compra.</li>
              </ul>
            </div>

            <div className="pol-card-blue">
              <strong>💙 Devoluciones en dinero</strong><br /><br />
              MatCell realiza devoluciones en dinero solo en estos casos excepcionales:
              <ul className="pol-list" style={{ marginTop: '10px' }}>
                <li>• El producto enviado no corresponde al pedido.</li>
                <li>• El producto llegó dañado por transporte y no hay stock para reposición.</li>
                <li>• El producto no está disponible después de confirmado el pago.</li>
              </ul>
              <p style={{ marginTop: '10px' }}>El reembolso se realiza por el mismo medio de pago en un plazo máximo de <strong>5 días hábiles</strong>.</p>
            </div>
          </section>

        </main>
      </div>

      {/* ── Contacto final ───────────────── */}
      <section className="pol-contacto">
        <h2>¿Tienes alguna duda?</h2>
        <p>Estamos aquí para ayudarte.</p>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="pol-wa-btn">
          <FaWhatsapp size={20} />
          Escríbenos por WhatsApp
        </a>
        <p className="pol-contacto-sub">matcellhq29@gmail.com · Ciénaga, Magdalena, Colombia</p>
      </section>

    </div>
  )
}
