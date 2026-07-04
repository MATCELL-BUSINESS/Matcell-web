import './VideoSection.css'

const VIDEOS = [
  { id: '1206912942', titulo: 'Top celulares' },
  { id: '1206912681', titulo: 'Unboxing MacBook' },
  { id: '1206912642', titulo: 'Empacando pedido' },
]

export default function VideoSection() {
  return (
    <section className="video-section">
      <h2 className="video-section-titulo">MatCell en acción</h2>
      <div className="video-grid">
        {VIDEOS.map((v) => (
          <div key={v.id} className="video-wrapper">
            <div className="video-ratio">
              <iframe
                src={`https://player.vimeo.com/video/${v.id}?title=0&byline=0&portrait=0&muted=0&autoplay=0`}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={v.titulo}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
