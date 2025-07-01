import React from "react"
import { Desktop, ListingDetailItem, Mobile, t } from "@bloom-housing/ui-components"
import { getListingAddressString } from "../../util/listingUtil"
import { RailsListing } from "../listings/SharedHelpers"
import { getCurrentLanguage } from "../../util/languageUtil"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"

export interface ListingDetailsEligibilityProps {
  imageSrc: string
  listing: RailsListing
}

export const ListingDetailsNeighborhood = ({
  imageSrc,
  listing,
}: ListingDetailsEligibilityProps) => {
  const listingAddress = getListingAddressString(listing)
  const { unleashFlag: translationsReady } = useFeatureFlag(
    "temp.webapp.listings.neighborhoodHeader",
    false
  )

  if (!listingAddress) {
    return null
  }

  const lang = getCurrentLanguage(window.location.pathname)
  const iframeUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.GOOGLE_PLACES_KEY}&q=${listingAddress}&language=${lang}`

  if (translationsReady) {
    return (
      <>
        <Desktop>
          <ListingDetailItem
            desktopClass="bg-primary-lighter"
            imageAlt={""}
            imageSrc={imageSrc}
            title={t("listings.neighborhood.header")}
            subtitle={t("listings.neighborhood.subheader")}
          >
            <iframe
              className="md:mb-6 md:pl-16 pl-0"
              src={iframeUrl}
              title={t("listings.neighborhood.mapTitle", {
                listingAddress: listingAddress,
              })}
              width="100%"
              height="450"
            />
          </ListingDetailItem>
        </Desktop>

        <Mobile>
          <ListingDetailItem
            desktopClass="bg-primary-lighter"
            imageAlt={""}
            imageSrc={imageSrc}
            title={t("listings.neighborhood.header.mobile")}
            subtitle={t("listings.neighborhood.subheader")}
          >
            <iframe
              className="md:mb-6 md:pl-16 pl-0"
              src={iframeUrl}
              title={t("listings.neighborhood.mapTitle", {
                listingAddress: listingAddress,
              })}
              width="100%"
              height="450"
            />
          </ListingDetailItem>
        </Mobile>
      </>
    )
  }

  // TODO:Remove once translations are ready
  return (
    <ListingDetailItem
      desktopClass="bg-primary-lighter"
      imageAlt={""}
      imageSrc={imageSrc}
      title={t("listings.neighborhood.header")}
      subtitle={t("listings.neighborhood.subheader")}
    >
      <iframe
        className="md:mb-6 md:pl-16 pl-0"
        src={iframeUrl}
        title={t("listings.neighborhood.mapTitle", {
          listingAddress: listingAddress,
        })}
        width="100%"
        height="450"
      />
    </ListingDetailItem>
  )
}
