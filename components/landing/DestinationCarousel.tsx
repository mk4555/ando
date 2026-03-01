'use client'

import { useEffect, useRef } from 'react'
import styles from './DestinationCarousel.module.css'

interface Destination {
  city: string
  country: string
  image: string
  trending: boolean
}

const DESTINATIONS: Destination[] = [
  { city: 'Kyoto',     country: 'Japan',     image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&q=80', trending: true  },
  { city: 'Lisbon',    country: 'Portugal',  image: 'https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?w=500&q=80', trending: true  },
  { city: 'Paris',     country: 'France',    image: 'https://images.unsplash.com/photo-1431274172761-fcdab704f4f0?w=500&q=80', trending: false },
  { city: 'Tokyo',     country: 'Japan',     image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&q=80', trending: true  },
  { city: 'Rome',      country: 'Italy',     image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500&q=80', trending: false },
  { city: 'Bangkok',   country: 'Thailand',  image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=500&q=80', trending: true  },
  { city: 'Bali',      country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80', trending: false },
  { city: 'Barcelona', country: 'Spain',     image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=500&q=80', trending: false },
]

const StarIcon = () => (
  <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
    <path d="M5 1l1.2 2.6 2.8.4-2 2 .5 2.8L5 7.5 2.5 8.8l.5-2.8-2-2 2.8-.4z" />
  </svg>
)

export default function DestinationCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const original = Array.from(track.children) as HTMLElement[]
    original.forEach(card => {
      const clone = card.cloneNode(true) as HTMLElement
      clone.setAttribute('aria-hidden', 'true')
      track.appendChild(clone)
    })

    const SPEED = 40 // px per second — adjust this single constant if speed feels wrong
    let rafId: number
    let lastTs: number | null = null
    let paused = false

    const tick = (ts: number) => {
      if (!lastTs) lastTs = ts
      const dt = (ts - lastTs) / 1000 // seconds
      lastTs = ts

      if (!paused && track.scrollWidth > 0) {
        track.scrollLeft += SPEED * dt
        const half = track.scrollWidth / 2
        if (track.scrollLeft >= half) {
          track.scrollLeft -= half
        }
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    const onEnter = () => { paused = true }
    const onLeave = () => { paused = false; lastTs = null }
    const onTouchStart = () => { paused = true }
    let touchEndTimer: ReturnType<typeof setTimeout>
    const onTouchEnd = () => {
      clearTimeout(touchEndTimer)
      touchEndTimer = setTimeout(() => { paused = false; lastTs = null }, 1200)
    }

    track.addEventListener('mouseenter', onEnter)
    track.addEventListener('mouseleave', onLeave)
    track.addEventListener('touchstart', onTouchStart, { passive: true })
    track.addEventListener('touchend', onTouchEnd, { passive: true })

    // Drag-to-scrub
    let isDragging = false
    let dragStartX = 0
    let dragScrollStart = 0

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      paused = true
      dragStartX = e.clientX
      dragScrollStart = track.scrollLeft
      track.classList.add(styles.isDragging)
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      track.scrollLeft = dragScrollStart - (e.clientX - dragStartX)
    }
    let dragEndTimer: ReturnType<typeof setTimeout>
    const onMouseUp = () => {
      if (!isDragging) return
      isDragging = false
      track.classList.remove(styles.isDragging)
      clearTimeout(dragEndTimer)
      dragEndTimer = setTimeout(() => { paused = false; lastTs = null }, 800)
    }

    track.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(touchEndTimer)
      clearTimeout(dragEndTimer)
      track.removeEventListener('mouseenter', onEnter)
      track.removeEventListener('mouseleave', onLeave)
      track.removeEventListener('touchstart', onTouchStart)
      track.removeEventListener('touchend', onTouchEnd)
      track.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <div className={styles.carouselMask}>
      <div className={styles.carouselTrack} ref={trackRef}>
        {DESTINATIONS.map(dest => (
          <div key={dest.city} className={styles.dcard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dest.image}
              alt={dest.city}
              className={styles.dcardImg}
              loading="lazy"
              draggable="false"
            />
            <div className={styles.dcardOverlay} />
            {dest.trending && (
              <div className={styles.dcardBadge}>
                <StarIcon />
                Trending
              </div>
            )}
            <div className={styles.dcardInfo}>
              <div className={styles.dcardCity}>{dest.city}</div>
              <div className={styles.dcardCountry}>{dest.country}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
