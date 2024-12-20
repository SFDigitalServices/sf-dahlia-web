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
  directorySectionInfo,
  activeItem,
  listings,
}: {
  directorySectionInfo: DirectorySectionInfoObject[]
  activeItem: string
  listings: ListingsGroups
}) => {
  return (
    <div id="nav-bar-container" className="directory-page-navigation-bar__container">
      <div className="directory-page-navigation-bar">
        {directorySectionInfo.map((section, index) => {
          return (
            <Button
              id={`nav-bar-button-${section.ref}`}
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
    </div>
  )
}
export default DirectoryPageNavigationBar
