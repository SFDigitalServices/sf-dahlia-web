import { Heading } from "@bloom-housing/ui-seeds"
import React, { ReactNode } from "react"
import "./EmptyListingsView.scss"
import { Icon, t, UniversalIconType } from "@bloom-housing/ui-components"
import { renderInlineMarkup } from "../../../util/languageUtil"
import { DirectorySectionType } from "../DirectoryHelpers"
import {
  DIRECTORY_SECTION_FCFS_LISTINGS,
  DIRECTORY_SECTION_INFO,
  DIRECTORY_SECTION_OPEN_LOTTERIES,
} from "../../constants"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"

export const EmptyListingsView = ({
  listingsCount,
  section,
  icon,
}: {
  listingsCount?: number
  section: DirectorySectionType
  icon?: ReactNode | string
}) => {
  const { unleashFlag: newDirectoryEnabled } = useFeatureFlag(
    "temp.webapp.directory.listings",
    false
  )

  if (!newDirectoryEnabled) {
    return null
  }

  return (
    <div className="empty-listings-view">
      {
        // 'section' will be:
        // DIRECTORY_SECTION_OPEN_LOTTERIES: listingDirectory.emptyListingsView.title.open
        // DIRECTORY_SECTION_FCFS_LISTINGS: listingDirectory.emptyListingsView.title.fcfs
        // DIRECTORY_SECTION_UPCOMING_LOTTERIES: listingDirectory.emptyListingsView.title.upcoming
        // DIRECTORY_SECTION_LOTTERY_RESULTS: listingDirectory.emptyListingsView.title.results
      }
      <Heading size="xl">{t(`listingDirectory.emptyListingsView.title.${section}`)}</Heading>
      <div className="empty-listings-view_content">
        {listingsCount > 0 &&
          (section === DIRECTORY_SECTION_OPEN_LOTTERIES ||
            section === DIRECTORY_SECTION_FCFS_LISTINGS) && (
            <div>
              {typeof icon === "string" ? (
                <Icon
                  className="empty-state-icon"
                  size="medium"
                  symbol={icon as UniversalIconType}
                />
              ) : (
                <span className="empty-state-icon ui-icon ui-medium">{icon}</span>
              )}
              {renderInlineMarkup(
                // listingsCount only used for DIRECTORY_SECTION_OPEN_LOTTERIES and DIRECTORY_SECTION_FCFS_LISTINGS section
                // DIRECTORY_SECTION_OPEN_LOTTERIES: listingDirectory.emptyListingsView.open
                // DIRECTORY_SECTION_FCFS_LISTINGS: listingDirectory.emptyListingsView.fcfs
                t(`listingDirectory.emptyListingsView.${section}`, {
                  numListings: listingsCount,
                  target:
                    section === DIRECTORY_SECTION_OPEN_LOTTERIES
                      ? `#${DIRECTORY_SECTION_INFO[DIRECTORY_SECTION_FCFS_LISTINGS].ref}`
                      : `#${DIRECTORY_SECTION_INFO[DIRECTORY_SECTION_OPEN_LOTTERIES].ref}`,
                })
              )}
            </div>
          )}
        <div>
          <Icon className="empty-state-icon" size="medium" symbol="envelope" />
          {renderInlineMarkup(
            t("listingDirectory.emptyListingsView.getAnEmail", {
              target: "https://confirmsubscription.com/h/y/C3BAFCD742D47910",
            })
          )}
        </div>
      </div>
    </div>
  )
}
