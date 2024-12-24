import { Button, Icon, UniversalIconType } from "@bloom-housing/ui-components"
import React, { useState } from "react"

export interface ListingsGroupProps {
  children?: React.ReactNode
  header: string
  hideButtonText: string
  icon?: UniversalIconType
  info?: string
  listingsCount: number
  showButtonText: string
  refKey: string
  observerRef: React.MutableRefObject<null | IntersectionObserver>
}

const ListingsGroup = (props: ListingsGroupProps) => {
  const [showListings, setShowListings] = useState(false)
  const toggleListings = () => setShowListings(!showListings)

  const listingsCount = ` (${props.listingsCount})`

  return (
    <div className="listings-group">
      <div className="listings-group__header">
        <div className={"listings-group__content"}>
          <div className="listings-group__icon">
            <Icon size="xlarge" symbol={props.icon ?? `clock`} />
          </div>
          <div className="listings-group__header-group">
            <h2
              id={props.refKey}
              ref={(el) => {
                if (el) {
                  props.observerRef?.current?.observe(el)
                }
              }}
              className="listings-group__title"
            >
              {props.header}
            </h2>
            {props.info && <div className="listings-group__info">{props.info}</div>}
          </div>
        </div>
        <div className="listings-group__button">
          <Button className="w-full" onClick={() => toggleListings()}>
            {showListings
              ? props.hideButtonText + listingsCount
              : props.showButtonText + listingsCount}
          </Button>
        </div>
      </div>
      {showListings && props.children}
    </div>
  )
}

export { ListingsGroup as default, ListingsGroup }
