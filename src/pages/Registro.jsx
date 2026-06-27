import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthForm.css'

export default function Registro() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [registroExitoso, setRegistroExitoso] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await signUp({ email, password, nombre })
      setRegistroExitoso(true)
    } catch (err) {
      if (err.message?.includes('already registered')) {
        setError('Ya existe una cuenta con ese correo. Intenta iniciar sesión.')
      } else if (err.message?.includes('Password')) {
        setError('La contraseña debe tener al menos 6 caracteres.')
      } else if (err.code === 'over_email_send_rate_limit') {
        setError('Se enviaron demasiados correos en poco tiempo. Espera unos minutos e intenta de nuevo.')
      } else {
        setError('No pudimos crear tu cuenta. Intenta de nuevo.')
      }
    } finally {
      setEnviando(false)
    }
  }

  if (registroExitoso) {
    return (
      <div className="auth-page">
        <div className="auth-form">
          <h1>¡Revisa tu correo!</h1>
          <p className="auth-subtext">
            Te enviamos un enlace de confirmación a <strong>{email}</strong>.
            Confírmalo para activar tu cuenta y poder iniciar sesión.
          </p>
          <Link to="/" className="btn btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Crear cuenta</h1>
        <p className="auth-subtext">
          Crear una cuenta es opcional — podrás guardar tus pedidos y tu
          lista de deseos, pero siempre puedes comprar como invitado.
        </p>

        <label>
          Nombre completo
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </label>
        <label>
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  )
}
