import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const cargarPerfil = async (userId) => {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data } = await supabase
      .from('perfiles')
      .select('id, nombre, telefono, direccion, departamento, ciudad')
      .eq('id', userId)
      .maybeSingle()
    setProfile(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      cargarPerfil(data.session?.user?.id).finally(() => setLoading(false))
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nuevaSesion) => {
      setSession(nuevaSesion)
      cargarPerfil(nuevaSesion?.user?.id)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signUp = async ({ email, password, nombre }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    })
    if (error) throw error
  }

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('suspendido')
      .eq('id', data.user.id)
      .maybeSingle()

    if (perfil?.suspendido) {
      await supabase.auth.signOut()
      const error = new Error(
        'Tu cuenta ha sido suspendida, contáctanos por WhatsApp para más información.'
      )
      error.code = 'cuenta_suspendida'
      throw error
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const refreshProfile = () => cargarPerfil(session?.user?.id)

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
