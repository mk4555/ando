import Link from 'next/link'
import styles from './Navbar.module.css'
import SignInButton from '@/components/landing/SignInButton'

interface Props {
  isLoggedIn: boolean
}

export default function Navbar({ isLoggedIn }: Props) {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        and<span className={styles.logoAccent}>o</span>
      </Link>
      <div className={styles.navActions}>
        {!isLoggedIn && (
          <SignInButton className={styles.navSignin}>Sign in</SignInButton>
        )}
        {isLoggedIn ? (
          <Link href="/dashboard" className={styles.navCta}>Go to dashboard</Link>
        ) : (
          <SignInButton className={styles.navCta}>Get started</SignInButton>
        )}
      </div>
    </nav>
  )
}
