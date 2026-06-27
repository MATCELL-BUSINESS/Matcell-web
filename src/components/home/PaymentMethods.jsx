import { FiCreditCard, FiShield, FiClock } from 'react-icons/fi'
import './PaymentMethods.css'

const METHODS = [
  { label: 'Tarjeta crédito/débito', icon: FiCreditCard },
  { label: 'PSE', icon: FiShield },
  { label: 'Crédito Nequi', icon: FiCreditCard },
  { label: 'Bancolombia BNPL · Compra ahora, paga después', icon: FiClock },
]

export default function PaymentMethods() {
  return (
    <section className="payment-methods">
      <h2>Métodos de pago</h2>
      <p className="payment-subtext">
        Todos los pagos se procesan de forma 100% segura a través de Wompi.
      </p>
      <div className="payment-grid">
        {METHODS.map(({ label, icon: Icon }) => (
          <div key={label} className="payment-card">
            <Icon size={18} />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p className="payment-footnote">Procesado por Wompi</p>
    </section>
  )
}
