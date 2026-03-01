import styles from './login.module.css'
import SignInButton from '@/components/landing/SignInButton'
import DestinationCarousel from '@/components/landing/DestinationCarousel'

export default function LoginPage() {
  return (
    <>
      {/* ── NAV ── */}
      <nav className={styles.nav}>
        <span className={styles.logo}>
          and<span className={styles.logoAccent}>o</span>
        </span>
        <div className={styles.navActions}>
          <SignInButton className={styles.navSignin}>Sign in</SignInButton>
          <SignInButton className={styles.navCta}>Get started</SignInButton>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        {/* Eyebrow pill */}
        <div className={styles.eyebrow}>
          <div className={styles.eyebrowDot} />
          AI-powered travel planning
        </div>

        {/* Wordmark */}
        <h1 className={styles.wordmark}>
          and<span className={styles.wordmarkAccent}>o</span>
        </h1>

        {/* Subheadline */}
        <p className={styles.sub}>
          Tell Ando how you travel — your pace, budget, and interests.
          It builds a day-by-day itinerary that actually fits you.
        </p>

        {/* Social proof */}
        <div className={styles.socialProof}>
          <div className={styles.avatarStack}>
            <div className={styles.av} style={{ background: '#dbe8f8' }}>S</div>
            <div className={styles.av} style={{ background: '#d8eee4' }}>J</div>
            <div className={styles.av} style={{ background: '#f0e4d4' }}>M</div>
            <div className={styles.av} style={{ background: '#e4daf5' }}>A</div>
          </div>
          <span className={styles.socialProofText}>
            <strong>140+ trips</strong> planned this month
          </span>
        </div>

        {/* Hero CTA */}
        <div className={styles.ctaGroup}>
          <SignInButton className={styles.heroBtn}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Start planning — it&apos;s free
          </SignInButton>
        </div>

        {/* Trust row */}
        <div className={styles.trustRow}>
          <span>No credit card</span>
          <div className={styles.trustDot} />
          <span>Ready in under a minute</span>
          <div className={styles.trustDot} />
          <span>Your data stays yours</span>
        </div>

        {/* Destination carousel */}
        <div className={styles.carouselSection}>
          <div className={styles.carouselHeader}>
            <span className={styles.carouselLabel}>Popular right now</span>
          </div>
          <DestinationCarousel />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <div className={styles.how} id="how">
        <p className={styles.sectionEyebrow}>Built for real travelers</p>
        <h2 className={styles.sectionTitle}>
          Everything handled.<br />Nothing unnecessary.
        </h2>
        <div className={styles.features}>

          <div className={styles.feat}>
            <div className={styles.featIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className={styles.featBody}>
              <div className={styles.featTitle}>Made for how you travel</div>
              <p className={styles.featDesc}>
                Set your pace, budget, and interests once. Every itinerary Ando builds
                is calibrated to you — not a generic tourist route.
              </p>
            </div>
          </div>

          <div className={styles.feat}>
            <div className={styles.featIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className={styles.featBody}>
              <div className={styles.featTitle}>Day-by-day, hour-by-hour</div>
              <p className={styles.featDesc}>
                Activities, meals, transit, timing, cost estimates — fully sequenced.
                Not a list of places. A plan you can actually follow.
              </p>
            </div>
          </div>

          <div className={styles.feat}>
            <div className={styles.featIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
              </svg>
            </div>
            <div className={styles.featBody}>
              <div className={styles.featTitle}>Doesn&apos;t feel right? Regenerate.</div>
              <p className={styles.featDesc}>
                One tap to get a fresh itinerary. Adjust your preferences and go again
                until the plan matches what you actually want.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── TESTIMONIAL ── */}
      <div className={styles.testimonial}>
        <div className={styles.tMark}>&ldquo;</div>
        <p className={styles.tQuote}>
          I&apos;ve never felt so prepared for a trip — and it took me less than two minutes to plan it.
        </p>
        <p className={styles.tAuthor}>Early tester · 7-day trip to Japan</p>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div className={styles.ctaSection} id="cta">
        <h2 className={styles.ctaTitle}>
          Ready to plan something <em>real</em>?
        </h2>
        <p className={styles.ctaSub}>Free to start. No credit card required.</p>
        <SignInButton className={styles.gBtn}>
          <svg
            className={styles.gIcon}
            viewBox="0 0 18 18"
            aria-hidden="true"
            width="18"
            height="18"
          >
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
            <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
          </svg>
          Continue with Google
        </SignInButton>
        <p className={styles.ctaNote}>Your data is yours. We never sell it.</p>
      </div>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>ando</div>
        <div className={styles.footerCopy}>© 2026 Ando. All rights reserved.</div>
      </footer>
    </>
  )
}
