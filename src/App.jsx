import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { TiendaConfigProvider } from './context/TiendaConfigContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import ProductoDetalle from './pages/ProductoDetalle'
import Checkout from './pages/Checkout'
import PedidoConfirmado from './pages/PedidoConfirmado'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Cuenta from './pages/Cuenta'
import MisPedidos from './pages/MisPedidos'
import MiListaDeseos from './pages/MiListaDeseos'

function App() {
  return (
    <TiendaConfigProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo/:slug" element={<Catalogo />} />
                <Route path="/producto/:id" element={<ProductoDetalle />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/pedido-confirmado" element={<PedidoConfirmado />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/cuenta" element={<Cuenta />} />
                <Route path="/mis-pedidos" element={<MisPedidos />} />
                <Route path="/mi-lista-deseos" element={<MiListaDeseos />} />
              </Route>
            </Routes>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </TiendaConfigProvider>
  )
}

export default App
