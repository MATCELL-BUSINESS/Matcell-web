import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import WhatsAppButton from './WhatsAppButton'
import CartDrawer from '../cart/CartDrawer'
import WishlistLoginPrompt from '../producto/WishlistLoginPrompt'
import { useWishlist } from '../../context/WishlistContext'

export default function Layout() {
  const { promptOpen, closePrompt } = useWishlist()

  return (
    <>
      <Header />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <CartDrawer />
      {promptOpen && <WishlistLoginPrompt onClose={closePrompt} />}
    </>
  )
}
