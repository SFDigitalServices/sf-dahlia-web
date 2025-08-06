import React from "react"
import { getListingAddressString } from "../../../util/listingUtil"
import { localizedFormat, formatTimeOfDay } from "../../../util/languageUtil"
import { t } from "@bloom-housing/ui-components"
import type { RailsListing } from "../../../modules/listings/SharedHelpers"
import fallbackImg from "../../../../assets/images/bg@1200.jpg"

interface IntroProps {
  listing: RailsListing
}

const Intro = ({ listing }: IntroProps) => {
  const imageUrl =
    listing?.Listing_Images?.length > 0
      ? listing.Listing_Images[0].displayImageURL
      : listing?.imageURL ?? fallbackImg

  return (
    <div>
      <h1>{t("a1Intro.title")}</h1>
      <p>{listing.Name}</p>
      <p>{getListingAddressString(listing)}</p>
      <p>
        {t("listingDetails.applicationsDeadline.withDateTime", {
          date: localizedFormat(listing.Application_Due_Date, "LL"),
          time: formatTimeOfDay(listing.Application_Due_Date),
        })}
      </p>
      <img src={imageUrl} alt="" />
    </div>
  )
}

export default Intro
