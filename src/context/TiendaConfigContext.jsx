import { createContext, useContext, useEffect, useState } from 'react'
import { getTiendaConfig } from '../lib/api'

const TiendaConfigContext = createContext(null)

// Valores de respaldo mientras carga la configuración o si el admin todavía
// no ha llenado un campo en tienda_config.
const VALORES_POR_DEFECTO = {
  nombre_tienda: 'MatCell',
  whatsapp: '573046789119',
  instagram_url: '#',
  facebook_url: '#',
  tiktok_url: '#',
  descripcion_footer: 'Tecnología certificada, precio real. Ciénaga, Magdalena, Colombia.',
  mensaje_barra_superior: 'Garantía hasta 12 meses · Pago 100% seguro',
}

export function TiendaConfigProvider({ children }) {
  const [config, setConfig] = useState(VALORES_POR_DEFECTO)

  useEffect(() => {
    getTiendaConfig()
      .then((data) => {
        if (!data) return
        setConfig((actual) => ({
          ...actual,
          ...Object.fromEntries(
            Object.entries(data).filter(([, valor]) => valor != null && valor !== '')
          ),
        }))
      })
      .catch(console.error)
  }, [])

  return <TiendaConfigContext.Provider value={config}>{children}</TiendaConfigContext.Provider>
}

export function useTiendaConfig() {
  const context = useContext(TiendaConfigContext)
  if (!context) throw new Error('useTiendaConfig debe usarse dentro de TiendaConfigProvider')
  return context
}
