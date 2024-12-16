import { Heading } from "@bloom-housing/ui-seeds"
import React from "react"
import "./EmptyListingsView.scss"
import { t } from "@bloom-housing/ui-components"
import { renderInlineMarkup } from "../../../util/languageUtil"

export const EmptyListingsView = ({
  directoryType,
  unitsCount,
}: {
  directoryType: string
  unitsCount: number
}) => {
  return (
    <div className="empty-listings-view">
      <Heading size="xl">{t("listingDirectory.emptyListingsView.title")}</Heading>
      <div className="empty-listings-view_subheader">
        {t(`listingDirectory.emptyListingsView.${directoryType}.subtitle`)}
      </div>
      {unitsCount > 0 && (
        <div className="empty-listings-view_content">
          {renderInlineMarkup(
            t("listingDirectory.emptyListingsView.unitsAvailableNow", {
              numUnits: unitsCount,
              target: "#",
            })
          )}
        </div>
      )}
      <div className="empty-listings-view_content">
        {renderInlineMarkup(t("listingDirectory.emptyListingsView.getAnEmail", { target: "#" }))}
      </div>
    </div>
  )
}
