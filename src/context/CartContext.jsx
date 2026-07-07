import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'matcell_cart'

function leerCarritoGuardado() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(leerCarritoGuardado)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (nuevoItem) => {
    setItems((actuales) => {
      const existente = actuales.find(
        (item) => item.productoId === nuevoItem.productoId && item.color === nuevoItem.color
      )

      if (existente) {
        const cantidadDeseada = existente.cantidad + (nuevoItem.cantidad ?? 1)
        const tope = existente.stockDisponible ?? Infinity
        return actuales.map((item) =>
          item.cartItemId === existente.cartItemId
            ? { ...item, cantidad: Math.min(cantidadDeseada, tope) }
            : item
        )
      }

      return [
        ...actuales,
        {
          cartItemId: `${nuevoItem.productoId}-${nuevoItem.color ?? 'sin-color'}-${Date.now()}`,
          cantidad: 1,
          ...nuevoItem,
        },
      ]
    })
    setDrawerOpen(true)
  }

  const addItemSilent = (nuevoItem) => {
    setItems((actuales) => {
      const existente = actuales.find(
        (item) => item.productoId === nuevoItem.productoId && item.color === nuevoItem.color
      )
      if (existente) {
        const cantidadDeseada = existente.cantidad + (nuevoItem.cantidad ?? 1)
        const tope = existente.stockDisponible ?? Infinity
        return actuales.map((item) =>
          item.cartItemId === existente.cartItemId
            ? { ...item, cantidad: Math.min(cantidadDeseada, tope) }
            : item
        )
      }
      return [
        ...actuales,
        {
          cartItemId: `${nuevoItem.productoId}-${nuevoItem.color ?? 'sin-color'}-${Date.now()}`,
          cantidad: 1,
          ...nuevoItem,
        },
      ]
    })
  }

  const removeItem = (cartItemId) => {
    setItems((actuales) => actuales.filter((item) => item.cartItemId !== cartItemId))
  }

  const updateCantidad = (cartItemId, cantidad) => {
    setItems((actuales) =>
      actuales.map((item) => {
        if (item.cartItemId !== cartItemId) return item
        const tope = item.stockDisponible ?? Infinity
        const nuevaCantidad = Math.max(1, Math.min(cantidad, tope))
        return { ...item, cantidad: nuevaCantidad }
      })
    )
  }

  const applyBundle = (cartItemId, cantidadBundle, precioBundle, descripcion) => {
    setItems((actuales) =>
      actuales.map((item) => {
        if (item.cartItemId !== cartItemId) return item
        return {
          ...item,
          cantidad: cantidadBundle,
          precio: precioBundle,
          esBundle: true,
          bundleDescripcion: descripcion,
          precioOriginal: item.precioOriginal ?? item.precio,
        }
      })
    )
  }

  const clearCart = () => setItems([])

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
    [items]
  )

  const cantidadTotal = useMemo(
    () => items.reduce((acc, item) => acc + item.cantidad, 0),
    [items]
  )

  const value = {
    items,
    addItem,
    addItemSilent,
    removeItem,
    updateCantidad,
    applyBundle,
    clearCart,
    subtotal,
    cantidadTotal,
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider')
  return context
}
