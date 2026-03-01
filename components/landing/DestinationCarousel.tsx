"use client";

import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import styles from "./DestinationCarousel.module.css";

interface Destination {
  city: string;
  country: string;
  image: string;
  trending: boolean;
}

const DESTINATIONS: Destination[] = [
  {
    city: "Kyoto",
    country: "Japan",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&q=80",
    trending: true,
  },
  {
    city: "Lisbon",
    country: "Portugal",
    image:
      "https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?w=500&q=80",
    trending: true,
  },
  {
    city: "Paris",
    country: "France",
    image:
      "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=500&q=80",
    trending: false,
  },
  {
    city: "Tokyo",
    country: "Japan",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500&q=80",
    trending: true,
  },
  {
    city: "Rome",
    country: "Italy",
    image:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500&q=80",
    trending: false,
  },
  {
    city: "Bangkok",
    country: "Thailand",
    image:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=500&q=80",
    trending: true,
  },
  {
    city: "Bali",
    country: "Indonesia",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80",
    trending: false,
  },
  {
    city: "Barcelona",
    country: "Spain",
    image:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=500&q=80",
    trending: false,
  },
  {
    city: "Seoul",
    country: "South Korea",
    image:
      "https://images.unsplash.com/photo-1506816561089-5cc37b3aa9b0?w=500&q=80",
    trending: true,
  },
  {
    city: "New York",
    country: "USA",
    image:
      "https://images.unsplash.com/photo-1445023086979-7244a12345a8?w=500&q=80",
    trending: false,
  },
  {
    city: "Cairo",
    country: "Egypt",
    image:
      "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=500&q=80",
    trending: false,
  },
  {
    city: "Sydney",
    country: "Australia",
    image:
      "https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?w=500&q=80",
    trending: false,
  },
];

const StarIcon = () => (
  <svg
    width="9"
    height="9"
    viewBox="0 0 10 10"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M5 1l1.2 2.6 2.8.4-2 2 .5 2.8L5 7.5 2.5 8.8l.5-2.8-2-2 2.8-.4z" />
  </svg>
);

export default function DestinationCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true }, [
    AutoScroll({ speed: 1, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);

  return (
    <div className={styles.carouselMask}>
      <div className={styles.carouselViewport} ref={emblaRef}>
        <div className={styles.carouselTrack}>
          {DESTINATIONS.map((dest) => (
            <div key={dest.city} className={styles.slide}>
              <div className={styles.dcard}>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
