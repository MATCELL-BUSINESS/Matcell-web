import { FaWhatsapp } from 'react-icons/fa'
import { useTiendaConfig } from '../../context/TiendaConfigContext'
import './WhatsAppButton.css'

const DEFAULT_MESSAGE = 'Hola, quiero más información sobre sus productos.'

export default function WhatsAppButton() {
  const { whatsapp } = useTiendaConfig()
  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`

  return (
    <a
      href={href}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
    >
      <FaWhatsapp size={28} />
    </a>
  )
}
