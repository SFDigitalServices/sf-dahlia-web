import React, { useContext, useState } from "react"
import { ImageCard, t } from "@bloom-housing/ui-components"
import { getReservedCommunityType } from "../../util/languageUtil"
import { RailsListing } from "../listings/SharedHelpers"
import { getShareListingPath } from "../../util/routeUtil"
import { getListingAddressString } from "../../util/listingUtil"
import { ConfigContext } from "../../lib/ConfigContext"
import { ListingAddress } from "../../components/ListingAddress"
import fallbackImg from "../../../assets/images/bg@1200.jpg"

export interface ListingDetailsImageCardProps {
  listing: RailsListing
}

export const ListingDetailsImageCard = ({ listing }: ListingDetailsImageCardProps) => {
  const { getAssetPath } = useContext(ConfigContext)
  const listingAddress = getListingAddressString(listing)
  const shareButton = getAssetPath("share-button.svg")
  const shareButtonSelected = getAssetPath("share-button-selected.svg")
  const [shareImage, setShareImage] = useState(shareButton)

  return (
    <header className="image-card--leader">
      <ImageCard
        imageUrl={listing?.imageURL ?? fallbackImg}
        href={`/listings/${listing.listingID}`}
        tags={
          listing.Reserved_community_type
            ? [{ text: getReservedCommunityType(listing.Reserved_community_type) }]
            : undefined
        }
        description={"A picture of the building"}
      />
      <div className="flex flex-col md:items-start md:text-left p-3 text-center">
        <h1 className="font-sans font-semibold text-3xl">{listing.Name}</h1>
        <p className="my-1">
          <ListingAddress listing={listing} />
        </p>
        <div className="flex flex-col items-center md:flex-row md:justify-between md:w-full">
          <div>
            <p className="text-gray-700">{listing.Developer}</p>
            <p className="my-2">
              <a
                href={`https://www.google.com/maps/place/${encodeURIComponent(listingAddress)}`}
                target="_blank"
                aria-label={t("label.opensInNewWindow", { linkText: t("label.viewOnMap") })}
              >
                {t("label.viewOnMap")}
              </a>
            </p>
          </div>
          <div>
            <a
              href={`${getShareListingPath()}/${listing.listingID}`}
              onBlur={() => setShareImage(shareButton)}
              onFocus={() => setShareImage(shareButtonSelected)}
              onMouseEnter={() => setShareImage(shareButtonSelected)}
              onMouseLeave={() => setShareImage(shareButton)}
              target="_blank"
            >
              <img alt={t("label.share")} src={shareImage} />
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
