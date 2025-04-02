import React, { useRef, useLayoutEffect, MutableRefObject } from "react"
import "./ListingsGroup.scss"
import { Button, Icon, UniversalIconType } from "@bloom-housing/ui-components"

export interface ListingsGroupProps {
  children?: React.ReactNode
  header: string
  hideButtonText: string
  icon?: UniversalIconType
  info?: string
  listingsCount: number
  showButtonText: string
  refKey?: string
  addObservedElement: (elem: HTMLElement) => void
  showListings?: boolean
  setShowListings?: React.Dispatch<React.SetStateAction<boolean>>
}

const ListingsGroup = ({
  children,
  header,
  hideButtonText,
  icon,
  info,
  listingsCount,
  showButtonText,
  refKey,
  addObservedElement,
  showListings,
  setShowListings,
}: ListingsGroupProps) => {
  const toggleListings = () => setShowListings(!showListings)
  const container: MutableRefObject<null | HTMLDivElement> = useRef(null)

  useLayoutEffect(() => {
    addObservedElement(container.current)
  }, [addObservedElement])

  return (
    <div className="listings-group" id={refKey ?? header} ref={container}>
      <div className="listings-group__header">
        <div className="listings-group__content">
          <div className="listings-group__icon">
            <Icon size="xlarge" symbol={icon ?? `clock`} />
          </div>
          <div className="listings-group__header-group">
            <h2 className="listings-group__title">{header}</h2>
            {info && <div className="listings-group__info">{info}</div>}
          </div>
        </div>
        <div className="listings-group__button">
          <Button className="w-full" onClick={() => toggleListings()}>
            {showListings
              ? `${hideButtonText} (${listingsCount})`
              : `${showButtonText} (${listingsCount})`}
          </Button>
        </div>
      </div>
      {showListings && children}
    </div>
  )
}

export { ListingsGroup as default, ListingsGroup }
