// Vendored from @bloom-housing/ui-components src/overlays/LoadingOverlay.tsx
import React, { useMemo } from "react"
import { Icon } from "./Icon"
import "./LoadingOverlay.css"

type LoadingOverlayProps = {
  isLoading: boolean
  children: React.ReactNode
}

const LoadingOverlay = ({ isLoading, children }: LoadingOverlayProps) => {
  const content = useMemo(() => {
    if (!isLoading) return children

    return (
      <div className="loading-overlay" data-testid="loading-overlay">
        <Icon size="3xl" symbol="spinner" className="loading-overlay__spinner" />
        {children}
      </div>
    )
  }, [isLoading, children])

  return <>{content}</>
}

export { LoadingOverlay as default, LoadingOverlay }
