import React, { useContext, useState } from "react"
import { ImageCard, t } from "@bloom-housing/ui-components"
import type { ImageItem } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { getShareListingPath } from "../../util/routeUtil"
import { getListingAddressString, getTagContent } from "../../util/listingUtil"
import { ConfigContext } from "../../lib/ConfigContext"
import { ListingAddress } from "../../components/ListingAddress"
import fallbackImg from "../../../assets/images/bg@1200.jpg"
import "./ListingDetailsImageCard.scss"
import { getTranslatedString } from "../../util/languageUtil"

export interface ListingDetailsImageCardProps {
  listing: RailsListing
}

const createImageCardProps = (listing: RailsListing) => {
  const listingImages: ImageItem[] = listing?.Listing_Images?.map((listingImage) => {
    return {
      url: listingImage.displayImageURL,
      description: getTranslatedString(
        listingImage.Image_Description,
        `${listingImage.Id}.Listing_Images.Image_Description__c`,
        listing.translations
      ),
    }
  })

  return listingImages && listingImages.length > 0
    ? {
        props: {
          images: listingImages,
          description: t("listings.buildingImageAltText"),
          moreImagesLabel: t("listings.morePhotos"),
        },
      }
    : {
        props: {
          imageUrl: fallbackImg,
          description: "",
        },
      }
}

export const ListingDetailsImageCard = ({ listing }: ListingDetailsImageCardProps) => {
  const { getAssetPath } = useContext(ConfigContext)
  const listingAddress = getListingAddressString(listing)
  const shareButton = getAssetPath("share-button.svg")
  const shareButtonSelected = getAssetPath("share-button-selected.svg")
  const [shareImage, setShareImage] = useState(shareButton)

  const { props: imageCardProps } = createImageCardProps(listing)

  return (
    <header className="image-card--leader">
      <ImageCard
        innerClassName="translate"
        {...imageCardProps}
        tags={getTagContent(listing)}
        modalAriaTitle="true"
      />
      <div className="flex flex-col md:items-start md:text-left p-3 text-center">
        <h1 className="font-sans font-semibold text-2xl">{listing.Name}</h1>
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
          <a
            href={`${getShareListingPath()}/${listing.listingID}`}
            onBlur={() => setShareImage(shareButton)}
            onFocus={() => setShareImage(shareButtonSelected)}
            onMouseEnter={() => setShareImage(shareButtonSelected)}
            onMouseLeave={() => setShareImage(shareButton)}
            aria-label={t("pageTitle.shareThisListing")}
            target="_blank"
            className="share-button"
          >
            <img alt={t("label.shareListView")} src={shareImage} />
          </a>
        </div>
      </div>
    </header>
  )
}
