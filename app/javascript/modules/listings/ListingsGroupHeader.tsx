import React, { ReactNode } from "react"
import "./ListingsGroupHeader.scss"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"

export interface ListingsGroupProps {
  title: string
  icon?: ReactNode
  subtitle?: string
  children: React.ReactNode
}

const ListingsGroupHeader = ({ title, icon, subtitle, children }: ListingsGroupProps) => {
  const { unleashFlag: newDirectoryEnabled } = useFeatureFlag(
    "temp.webapp.directory.listings",
    false
  )

  if (!newDirectoryEnabled) {
    return children
  }

  return (
    <>
      <div className="listings-group__header listings-group__custom">
        <div className="listings-group__content">
          <div className="listings-group__icon">{icon}</div>
          <div className="listings-group__header-group">
            <h2 className="listings-group__title">{title}</h2>
            {subtitle && <div className="listings-group__info">{subtitle}</div>}
          </div>
        </div>
      </div>
      {children}
    </>
  )
}

export { ListingsGroupHeader as default, ListingsGroupHeader }
