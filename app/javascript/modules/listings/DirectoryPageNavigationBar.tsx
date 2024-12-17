import React from "react"
import "./DirectoryPageNavigationBar.scss"
import { Button } from "@bloom-housing/ui-seeds"
import { Icon, t } from "@bloom-housing/ui-components"

const DirectoryPageNavigationBar = ({
  directoryType,
  listingLengths,
  activeItem,
}: {
  directoryType: string
  listingLengths: { open: number; upcoming: number; fcfs: number; results: number }
  activeItem: string
  setActiveItem: React.Dispatch<string>
}) => {
  const directorySections =
    directoryType === "forSale"
      ? {
          open: { key: "enter-a-lottery", icon: "house" },
          fcfs: { key: "buy-now", icon: "house" },
          upcoming: { key: "upcoming-lotteries", icon: "house" },
          results: { key: "lottery-results", icon: "house" },
        }
      : {
          open: { key: "enter-a-lottery", icon: "house" },
          upcoming: { key: "upcoming-lotteries", icon: "house" },
          results: { key: "lottery-results", icon: "house" },
        }

  return (
    <div className="directory-page-navigation-bar">
      {Object.keys(directorySections).map((listingType, index) => {
        return (
          <Button
            key={`nav-button-${index}`}
            onClick={() => {
              document
                .querySelector(`#${directorySections[listingType].key}`)
                .scrollIntoView({ behavior: "smooth" })
            }}
            className={activeItem === directorySections[listingType].key ? "active" : ""}
          >
            <Icon size="medium" symbol={directorySections[listingType].icon} />
            {t(`listingsDirectory.navBar.${listingType}`, {
              numListings: listingLengths[listingType],
            })}
          </Button>
        )
      })}
    </div>
  )
}
export default DirectoryPageNavigationBar
