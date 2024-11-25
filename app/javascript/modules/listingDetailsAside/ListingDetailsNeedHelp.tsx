import { LinkButton, SidebarBlock, t } from "@bloom-housing/ui-components"
import React from "react"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { isRental } from "../../util/listingUtil"
import RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import { getHousingCounselorsPath } from "../../util/routeUtil"
import { getSfGovUrl } from "../../util/languageUtil"
import "./listing-details-need-help.scss"

export const NeedHelpBlock = ({ listing }: { listing: RailsSaleListing | RailsRentalListing }) => {
  const { unleashFlag: isSalesFcfsEnabled } = useFeatureFlag("FCFS", false)
  const isListingRental = isRental(listing)

  const getSalesNeedHelpLink = () => {
    return isSalesFcfsEnabled
      ? getSfGovUrl("https://www.sf.gov/resource/2022/homebuyer-program-counseling-agencies", 7209)
      : "https://www.homeownershipsf.org/buyerapplications/"
  }

  return (
    <div className="md:px-0 px-2">
      <SidebarBlock
        title={t("listings.apply.needHelp")}
        className="listing-details-need-help"
        priority={2}
      >
        {(isSalesFcfsEnabled || isListingRental) && (
          <div className={"mb-4"}>
            {isListingRental
              ? t("listings.apply.visitAHousingCounselor")
              : t("listingDetails.sales.aside.needHelp")}
          </div>
        )}
        <LinkButton
          transition
          newTab
          href={isListingRental ? getHousingCounselorsPath() : getSalesNeedHelpLink()}
          className="w-full"
        >
          {isListingRental || isSalesFcfsEnabled
            ? t("housingCounselor.findAHousingCounselor")
            : t("listings.apply.visitHomeownershipSf")}
        </LinkButton>
      </SidebarBlock>
    </div>
  )
}
