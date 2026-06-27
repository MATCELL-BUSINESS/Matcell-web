import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiPackage, FiHeart, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import './UserMenu.css'

export default function UserMenu() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) {
    return (
      <Link to="/login" className="user-icon" aria-label="Iniciar sesión">
        <FiUser size={22} />
      </Link>
    )
  }

  const handleLogout = async () => {
    await signOut()
    setOpen(false)
    navigate('/')
  }

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-icon" onClick={() => setOpen((o) => !o)} aria-label="Mi cuenta">
        <FiUser size={22} />
      </button>

      {open && (
        <div className="user-menu-dropdown">
          <p className="user-menu-saludo">Hola, {profile?.nombre || 'cliente'}</p>

          <Link to="/cuenta" onClick={() => setOpen(false)}>
            <FiUser size={16} /> Mi cuenta
          </Link>
          <Link to="/mis-pedidos" onClick={() => setOpen(false)}>
            <FiPackage size={16} /> Mis pedidos
          </Link>
          <Link to="/mi-lista-deseos" onClick={() => setOpen(false)}>
            <FiHeart size={16} /> Mi lista de deseos
          </Link>
          <button onClick={handleLogout} className="user-menu-logout">
            <FiLogOut size={16} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
