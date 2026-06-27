import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import './Cuenta.css'

export default function Cuenta() {
  const { user, profile, loading, refreshProfile } = useAuth()

  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    departamento: '',
    ciudad: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        nombre: profile.nombre ?? '',
        telefono: profile.telefono ?? '',
        direccion: profile.direccion ?? '',
        departamento: profile.departamento ?? '',
        ciudad: profile.ciudad ?? '',
      })
    }
  }, [profile])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  const setCampo = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setGuardado(false)
    await supabase.from('perfiles').update(form).eq('id', user.id)
    await refreshProfile()
    setGuardando(false)
    setGuardado(true)
  }

  return (
    <div className="cuenta-page">
      <h1>Mi cuenta</h1>
      <p className="cuenta-email">{user.email}</p>

      <form className="cuenta-form" onSubmit={handleSubmit}>
        <label>
          Nombre completo
          <input value={form.nombre} onChange={setCampo('nombre')} />
        </label>
        <label>
          Teléfono
          <input value={form.telefono} onChange={setCampo('telefono')} />
        </label>
        <label>
          Dirección
          <input value={form.direccion} onChange={setCampo('direccion')} />
        </label>
        <div className="cuenta-form-row">
          <label>
            Departamento
            <input value={form.departamento} onChange={setCampo('departamento')} />
          </label>
          <label>
            Ciudad
            <input value={form.ciudad} onChange={setCampo('ciudad')} />
          </label>
        </div>

        {guardado && <p className="cuenta-guardado">Cambios guardados.</p>}

        <button type="submit" className="btn btn-primary" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
