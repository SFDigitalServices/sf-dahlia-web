import React, { ReactNode } from "react"
import "./ListingsGroupHeader.scss"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"

export interface ListingsGroupProps {
  title: string
  icon?: ReactNode
  subtitle?: string
  children: React.ReactNode
  refKey: string
  observerRef: React.MutableRefObject<null | IntersectionObserver>
}

const ListingsGroupHeader = ({
  title,
  icon,
  subtitle,
  children,
  refKey,
  observerRef,
}: ListingsGroupProps) => {
  const { unleashFlag: newDirectoryEnabled } = useFeatureFlag(
    "temp.webapp.directory.listings",
    false
  )

  if (!newDirectoryEnabled) {
    return children
  }

  return (
    <>
      <div className="listings-group__header listings-group__customHeader">
        <div className="listings-group__content">
          <div className="listings-group__icon">{icon}</div>
          <div>
            <h2
              id={refKey}
              ref={(el) => {
                if (el) {
                  observerRef?.current?.observe(el)
                }
              }}
              className="listings-group__title"
            >
              {title}
            </h2>
            {subtitle && <div className="listings-group__info">{subtitle}</div>}
          </div>
        </div>
      </div>
      {children}
    </>
  )
}

export { ListingsGroupHeader as default, ListingsGroupHeader }
