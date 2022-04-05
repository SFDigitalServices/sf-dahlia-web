import { isSale, RailsListing } from "../listings/SharedHelpers"
import { AdditionalFees, Description, ListingDetailItem, t } from "@bloom-housing/ui-components"
import React from "react"

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
          <Description term={"Neighborhood"} description={listing.Neighborhood} />
          <Description term={"Built"} description={listing.Year_Built} />
          <Description term={"Parking"} description={listing.Parking_Information} />
          <Description term={"Smoking Policy"} description={listing.Smoking_Policy} />
          <Description term={"Pets Policy"} description={listing.Pet_Policy} />
          <Description term={"Property Amenities"} description={listing.Amenities} />
          <Description term={"Accessibility"} description={listing.Accessibility} />

          <Description term={"Unit Features"} description={""} />
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
