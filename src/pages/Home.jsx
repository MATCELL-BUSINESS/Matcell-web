import { useEffect, useState } from 'react'
import {
  getCategoriasActivas,
  getProductosDestacados,
  getResenasAprobadas,
  getInstagramPosts,
} from '../lib/api'
import Hero from '../components/home/Hero'
import VideoSection from '../components/home/VideoSection'
import QuickCategories from '../components/home/QuickCategories'
import BestSellers from '../components/home/BestSellers'
import HowWeCertify from '../components/home/HowWeCertify'
import WarrantyBlock from '../components/home/WarrantyBlock'
import Testimonials from '../components/home/Testimonials'
import InstagramFeed from '../components/home/InstagramFeed'
import PaymentMethods from '../components/home/PaymentMethods'
import FAQ from '../components/home/FAQ'

export default function Home() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [resenas, setResenas] = useState([])
  const [instagramPosts, setInstagramPosts] = useState([])

  useEffect(() => {
    getCategoriasActivas().then(setCategorias).catch(console.error)
    getProductosDestacados().then(setProductos).catch(console.error)
    getResenasAprobadas().then(setResenas).catch(console.error)
    getInstagramPosts().then(setInstagramPosts).catch(console.error)
  }, [])

  return (
    <>
      <Hero />
      <VideoSection />
      <QuickCategories categorias={categorias} />
      <BestSellers productos={productos} />
      <HowWeCertify />
      <WarrantyBlock />
      <Testimonials resenas={resenas} />
      <InstagramFeed posts={instagramPosts} />
      <PaymentMethods />
      <FAQ />
    </>
  )
}
