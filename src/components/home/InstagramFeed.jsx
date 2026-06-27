import { useRef } from 'react'
import { FaInstagram, FaPlay } from 'react-icons/fa'
import './InstagramFeed.css'

const PROFILE_URL = 'https://instagram.com/matcell29'

function InstagramItem({ post }) {
  const videoRef = useRef(null)
  const isVideo = post.media_type === 'VIDEO'

  const handleEnter = () => {
    if (isVideo) videoRef.current?.play()
  }

  const handleLeave = () => {
    if (isVideo) {
      videoRef.current?.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="instagram-item"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          src={post.media_url}
          poster={post.thumbnail_url || undefined}
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <img
          src={post.thumbnail_url || post.media_url}
          alt={post.caption ?? 'Publicación de Instagram'}
        />
      )}

      <div className="instagram-overlay">
        {isVideo ? <FaPlay size={18} /> : <FaInstagram size={22} />}
      </div>
    </a>
  )
}

export default function InstagramFeed({ posts = [] }) {
  if (posts.length === 0) return null

  return (
    <section className="instagram-feed">
      <div className="instagram-header">
        <FaInstagram size={28} />
        <h2>Síguenos en Instagram</h2>
        <p>@matcell29</p>
      </div>

      <div className="instagram-grid">
        {posts.map((post) => (
          <InstagramItem key={post.id} post={post} />
        ))}
      </div>

      <a
        href={PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary instagram-cta"
      >
        Ver más en Instagram
      </a>
    </section>
  )
}
