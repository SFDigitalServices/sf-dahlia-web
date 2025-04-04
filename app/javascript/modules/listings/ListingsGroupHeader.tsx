import React, { ReactNode, useRef, useLayoutEffect, MutableRefObject } from "react"
import "./ListingsGroupHeader.scss"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"

export interface ListingsGroupProps {
  title: string
  icon?: ReactNode
  subtitle?: string
  children: React.ReactNode
  refKey: string
  addObservedElement: (elem: HTMLElement) => void
}

const ListingsGroupHeader = ({
  title,
  icon,
  subtitle,
  children,
  refKey,
  addObservedElement,
}: ListingsGroupProps) => {
  const { unleashFlag: newDirectoryEnabled } = useFeatureFlag(
    "temp.webapp.directory.listings",
    false
  )

  const container: MutableRefObject<null | HTMLDivElement> = useRef(null)

  useLayoutEffect(() => {
    addObservedElement(container.current)
  }, [addObservedElement])

  if (!newDirectoryEnabled) {
    return children
  }

  return (
    <div id={refKey} ref={container}>
      <div className="listings-group__header listings-group__customHeader">
        <div className="listings-group__content">
          <div className="listings-group__icon">{icon}</div>
          <div>
            <h2 className="listings-group__title">{title}</h2>
            {subtitle && <div className="listings-group__info">{subtitle}</div>}
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

export { ListingsGroupHeader as default, ListingsGroupHeader }
