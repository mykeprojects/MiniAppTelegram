import { useState } from 'react'
import logo from '../../assets/logo.png'
import styles from './Header.module.css'

export function Header() {
  const [logoAvailable, setLogoAvailable] = useState(true)

  return (
    <header className={styles.header}>
      <a className={styles.brand} href="/" aria-label="Inicio">
        {logoAvailable ? (
          <img
            className={styles.logo}
            src={logo}
            alt=""
            onError={() => setLogoAvailable(false)}
          />
        ) : (
          <span className={styles.logoFallback} aria-hidden="true">
            UP
          </span>
        )}
        <span className={styles.brandName}>
          <span className={styles.brandUp}>Up</span>
          <span className={styles.brandNews}>News</span>
        </span>
      </a>
      <span className={styles.tag}>PUBLICAR NOTICIAS</span>
    </header>
  )
}
