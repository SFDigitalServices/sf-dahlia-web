import React, { ReactNode } from "react"
import "./ListingsGroupHeader.scss"

export interface ListingsGroupProps {
  title: string
  icon?: ReactNode
  subtitle?: string
}

const ListingsGroupHeader = ({ title, icon, subtitle }: ListingsGroupProps) => {
  return (
    <div className="listings-group__header">
      <div className={"listings-group__content"}>
        <div className="listings-group__icon">{icon}</div>
        <div className="listings-group__header-group">
          <h2 className="listings-group__title">{title}</h2>
          {subtitle && <div className="listings-group__info">{subtitle}</div>}
        </div>
      </div>
    </div>
  )
}

export { ListingsGroupHeader as default, ListingsGroupHeader }
