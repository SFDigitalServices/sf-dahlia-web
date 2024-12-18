import { Heading } from "@bloom-housing/ui-seeds"
import React from "react"
import "./EmptyListingsView.scss"
import { t } from "@bloom-housing/ui-components"
import { renderInlineMarkup } from "../../../util/languageUtil"
import { DirectoryType } from "../DirectoryHelpers"

export const EmptyListingsView = ({
  directoryType,
  listingsCount,
  section,
}: {
  directoryType: DirectoryType
  listingsCount: number
  section: "open" | "fcfs"
}) => {
  return (
    <div className="empty-listings-view">
      <Heading size="xl">{t(`listingDirectory.emptyListingsView.title.${section}`)}</Heading>
      <div className="empty-listings-view_subheader">
        {directoryType === "forRent" &&
          t(`listingDirectory.emptyListingsView.${directoryType}.subtitle`)}
      </div>
      <div className="empty-listings-view_content">
        <div>
          {listingsCount > 0 &&
            renderInlineMarkup(
              t(`listingDirectory.emptyListingsView.${section}`, {
                numListings: listingsCount,
                target: section === "open" ? "#buy-now" : "#enter-a-lottery",
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
