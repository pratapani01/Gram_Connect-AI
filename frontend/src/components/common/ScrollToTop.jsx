import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll the window (fallback)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    // Scroll the actual content container used in all layouts
    const main = document.querySelector('main')
    if (main) main.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}