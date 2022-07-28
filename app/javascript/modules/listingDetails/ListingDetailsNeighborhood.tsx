import React, { useContext } from "react"
import { ListingDetailItem, t } from "@bloom-housing/ui-components"
import { getListingAddressString } from "../../util/listingUtil"
import { RailsListing } from "../listings/SharedHelpers"
import Link from "../../navigation/Link"
import ConfigContext from "../../lib/ConfigContext"
import { getCurrentLanguage } from "../../util/languageUtil"

export interface ListingDetailsEligibilityProps {
  imageSrc: string
  listing: RailsListing
}

export const ListingDetailsNeighborhood = ({
  imageSrc,
  listing,
}: ListingDetailsEligibilityProps) => {
  const { getAssetPath } = useContext(ConfigContext)
  const listingAddress = getListingAddressString(listing)

  if (!listingAddress) {
    return null
  }

  const lang = getCurrentLanguage(window.location.pathname)
  const iframeUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.GOOGLE_PLACES_KEY}&q=${listingAddress}&language=${lang}`

  return (
    <ListingDetailItem
      desktopClass="bg-primary-lighter"
      imageAlt={""}
      imageSrc={imageSrc}
      title={t("listings.neighborhood.header")}
      subtitle={t("listings.neighborhood.subheader")}
    >
      <iframe
        src={iframeUrl}
        title={t("listings.neighborhood.mapTitle", {
          listingAddress: listingAddress,
        })}
        width="100%"
        height="450"
      />
      <div className="flex items-center mt-2 justify-center">
        <img className=" inline mx-1" alt="" src={getAssetPath("map.svg")} />
        <Link
          external={true}
          href={`https://www.google.com/maps/place/${encodeURIComponent(
            listingAddress
          )}&language=${lang}`}
          target="_blank"
        >
          {t("label.getDirections")}
        </Link>
      </div>
    </ListingDetailItem>
  )
}
