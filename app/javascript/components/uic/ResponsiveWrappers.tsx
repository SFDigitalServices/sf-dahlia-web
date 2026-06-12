// Vendored from @bloom-housing/ui-components src/sections/ResponsiveWrappers.tsx,
// reimplemented with window.matchMedia instead of react-media. The breakpoint
// matches the bloom tailwind config's screens.md (768px).
import * as React from "react"

export interface ResponsiveWrapperProps {
  children: React.ReactNode
}

const MD_BREAKPOINT = 768

const useMediaQuery = (query: string, defaultMatches: boolean) => {
  const [matches, setMatches] = React.useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(query).matches
      : defaultMatches
  )

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mediaQueryList = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)
    setMatches(mediaQueryList.matches)
    // addListener fallback for older browsers/jsdom mocks without addEventListener
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", onChange)
      return () => mediaQueryList.removeEventListener("change", onChange)
    } else {
      mediaQueryList.addListener(onChange)
      return () => mediaQueryList.removeListener(onChange)
    }
  }, [query])

  return matches
}

const Desktop = (props: ResponsiveWrapperProps) => {
  const matches = useMediaQuery(`(min-width: ${MD_BREAKPOINT}px)`, false)
  return matches ? <>{props.children}</> : null
}

const Mobile = (props: ResponsiveWrapperProps) => {
  const matches = useMediaQuery(`(max-width: ${MD_BREAKPOINT - 1}px)`, true)
  return matches ? <>{props.children}</> : null
}

export { Desktop, Mobile }
