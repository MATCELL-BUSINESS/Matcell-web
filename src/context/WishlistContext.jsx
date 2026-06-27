import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { getWishlistIds, agregarAWishlist, quitarDeWishlist } from '../lib/api'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [ids, setIds] = useState([])
  const [promptOpen, setPromptOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      setIds([])
      return
    }
    getWishlistIds(user.id).then(setIds).catch(console.error)
  }, [user])

  const isInWishlist = (productoId) => ids.includes(productoId)

  const toggle = async (productoId) => {
    if (!user) {
      setPromptOpen(true)
      return
    }

    if (ids.includes(productoId)) {
      setIds((actuales) => actuales.filter((id) => id !== productoId))
      try {
        await quitarDeWishlist(user.id, productoId)
      } catch (err) {
        console.error(err)
        setIds((actuales) => [...actuales, productoId])
      }
    } else {
      setIds((actuales) => [...actuales, productoId])
      try {
        await agregarAWishlist(user.id, productoId)
      } catch (err) {
        console.error(err)
        setIds((actuales) => actuales.filter((id) => id !== productoId))
      }
    }
  }

  const value = {
    isInWishlist,
    toggle,
    promptOpen,
    closePrompt: () => setPromptOpen(false),
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist debe usarse dentro de WishlistProvider')
  return context
}
