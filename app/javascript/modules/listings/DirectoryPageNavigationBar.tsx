import React, { ReactNode, useContext } from "react"
import "./DirectoryPageNavigationBar.scss"
import { Icon, t, UniversalIconType } from "@bloom-housing/ui-components"
import { ListingsGroups } from "./DirectoryHelpers"
import { ConfigContext } from "../../lib/ConfigContext"
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
  handleNavigation,
}: {
  directorySectionInfo: DirectorySectionInfoObject[]
  activeItem: string
  listings: ListingsGroups
  handleNavigation: (section: string) => void
}) => {
  const { getAssetPath } = useContext(ConfigContext)
  return (
    <div id="nav-bar-container" className="directory-page-navigation-bar__container">
      <div className="directory-page-navigation-bar">
        {directorySectionInfo.map((section, index) => {
          return (
            <a
              id={`nav-bar-button-${section.ref}`}
              href={`#${section.ref}`}
              key={`nav-button-${index}`}
              className={
                activeItem === section.ref
                  ? "seeds-button active directory-page-navigation-bar__button"
                  : "seeds-button directory-page-navigation-bar__button"
              }
              onClick={() => {
                handleNavigation(section.key)
                return true
              }}
            >
              {section.icon ? (
                <Icon size="medium" symbol={section.icon as UniversalIconType} />
              ) : (
                <img
                  src={getAssetPath("house-circle-check.svg")}
                  alt="House Circle Check"
                  width="16"
                  height="16"
                />
              )}
              {t(`listingsDirectory.navBar.${section.key}`, {
                numListings: listings[section.key].length,
              })}
            </a>
          )
        })}
      </div>
    </div>
  )
}
export default DirectoryPageNavigationBar
