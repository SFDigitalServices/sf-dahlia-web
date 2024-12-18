import React, { ReactNode } from "react"
import "./DirectoryPageNavigationBar.scss"
import { Button, Icon as SeedsIcon } from "@bloom-housing/ui-seeds"
import { Icon, t, UniversalIconType } from "@bloom-housing/ui-components"
import { ListingsGroups } from "./DirectoryHelpers"
interface DirectorySectionInfoObject {
  key: string
  ref: string
  icon: ReactNode | string
  numListings: number
}

const DirectoryPageNavigationBar = ({
  directorySections,
  activeItem,
  listings,
}: {
  directorySections: DirectorySectionInfoObject[]
  activeItem: string
  listings: ListingsGroups
}) => {
  return (
    <div className="directory-page-navigation-bar">
      {directorySections.map((section, index) => {
        return (
          <Button
            key={`nav-button-${index}`}
            onClick={() => {
              const yOffset = -60
              const element = document.querySelector(`#${section.ref}`)
              const y = element.getBoundingClientRect().top + window.scrollY + yOffset
              window.scrollTo({ top: y, behavior: "smooth" })
            }}
            className={
              activeItem === section.ref
                ? "active directory-page-navigation-bar__button"
                : "directory-page-navigation-bar__button"
            }
          >
            {typeof section.icon === "string" ? (
              <Icon size="medium" symbol={section.icon as UniversalIconType} />
            ) : (
              <SeedsIcon size="md">{section.icon}</SeedsIcon>
            )}
            {t(`listingsDirectory.navBar.${section.key}`, {
              numListings: listings[section.key].length,
            })}
          </Button>
        )
      })}
    </div>
  )
}
export default DirectoryPageNavigationBar
