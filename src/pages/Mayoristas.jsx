import './Mayoristas.css'

const WHATSAPP_URL = 'https://wa.me/573046789119?text=Hola%2C%20quiero%20vender%20con%20MatCell'

export default function Mayoristas() {
  return (
    <div className="mayoristas-page">
      <div className="mayoristas-card">
        <p className="mayoristas-etiqueta">Próximamente</p>
        <h1 className="mayoristas-titulo">Estamos preparando algo especial para ti</h1>
        <p className="mayoristas-texto">
          Pronto tendremos un programa exclusivo para vendedores y mayoristas.
          Si quieres ser de los primeros en enterarte, escríbenos por WhatsApp.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary mayoristas-btn"
        >
          Contáctanos por WhatsApp
        </a>
      </div>
    </div>
  )
}
