import { RailsListing } from "../listings/SharedHelpers"
import { AdditionalFees, Description, ListingDetailItem, t } from "@bloom-housing/ui-components"
import React from "react"
import { isSale } from "../../util/listingUtil"

export interface ListingDetailsFeaturesProps {
  listing: RailsListing
  imageSrc: string
}

export const ListingDetailsFeatures = ({ listing, imageSrc }: ListingDetailsFeaturesProps) => {
  return (
    <ListingDetailItem
      imageAlt={"Image Alt"}
      imageSrc={imageSrc}
      title={t("listings.features.header")}
      subtitle={
        isSale(listing)
          ? t("listings.features.saleSubheader")
          : t("listings.features.rentSubheader")
      }
    >
      <div className="listing-detail-panel">
        <dl className="column-definition-list">
          <Description
            term={t("listings.neighborhood.header")}
            description={listing.Neighborhood}
          />
          <Description term={t("listings.features.built")} description={listing.Year_Built} />
          <Description
            term={t("listings.features.parking")}
            description={listing.Parking_Information}
          />
          <Description
            term={t("listings.features.smokingPolicy")}
            description={listing.Smoking_Policy}
          />
          <Description term={t("listings.features.petsPolicy")} description={listing.Pet_Policy} />
          <Description
            term={t("listings.features.propertyAmenities")}
            description={listing.Amenities}
          />
          <Description
            term={t("listings.features.accessibility")}
            description={listing.Accessibility}
          />

          <Description term={t("listings.features.unitFeatures")} description={""} />
        </dl>
        <AdditionalFees
          depositMin={listing.Deposit_Min?.toLocaleString()}
          depositMax={listing.Deposit_Max?.toLocaleString()}
          applicationFee={listing.Fee?.toLocaleString()}
          costsNotIncluded={listing.Costs_Not_Included}
          depositHelperText={"or one month's rent"}
        />
      </div>
    </ListingDetailItem>
  )
}
