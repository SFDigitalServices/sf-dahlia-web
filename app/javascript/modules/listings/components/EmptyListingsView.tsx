import { Heading } from "@bloom-housing/ui-seeds"
import React from "react"
import "./EmptyListingsView.scss"
import { t } from "@bloom-housing/ui-components"
import { renderInlineMarkup } from "../../../util/languageUtil"
import { DirectorySectionType } from "../DirectoryHelpers"
import {
  DIRECTORY_SECTION_FCFS_LISTINGS,
  DIRECTORY_SECTION_INFO,
  DIRECTORY_SECTION_OPEN_LOTTERIES,
} from "../../constants"

export const EmptyListingsView = ({
  listingsCount,
  section,
}: {
  listingsCount?: number
  section: DirectorySectionType
}) => {
  return (
    <div className="empty-listings-view">
      <Heading size="xl">{t(`listingDirectory.emptyListingsView.title.${section}`)}</Heading>
      <div className="empty-listings-view_content">
        <div>
          {listingsCount > 0 &&
            renderInlineMarkup(
              t(`listingDirectory.emptyListingsView.${section}`, {
                numListings: listingsCount,
                target:
                  section === DIRECTORY_SECTION_OPEN_LOTTERIES
                    ? `#${DIRECTORY_SECTION_INFO[DIRECTORY_SECTION_FCFS_LISTINGS].ref}`
                    : `#${DIRECTORY_SECTION_INFO[DIRECTORY_SECTION_OPEN_LOTTERIES].ref}`,
              })
            )}
        </div>
        <div>
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
