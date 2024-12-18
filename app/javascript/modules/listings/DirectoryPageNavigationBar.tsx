import React, { ReactNode } from "react"
import "./DirectoryPageNavigationBar.scss"
import { Button } from "@bloom-housing/ui-seeds"
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
            href={`#${section.ref}`}
            key={`nav-button-${index}`}
            className={
              activeItem === section.ref
                ? "active directory-page-navigation-bar__button"
                : "directory-page-navigation-bar__button"
            }
          >
            {typeof section.icon === "string" ? (
              <Icon size="medium" symbol={section.icon as UniversalIconType} />
            ) : (
              <div className="ui-icon ui-medium">{section.icon}</div>
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
