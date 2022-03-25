import { RailsListing } from "../listings/SharedHelpers"
import { AdditionalFees, Description, ListingDetailItem } from "@bloom-housing/ui-components"
import React from "react"

export interface ListingDetailsFeaturesProps {
  listing: RailsListing
}

export const ListingDetailsFeatures = ({ listing }: ListingDetailsFeaturesProps) => {
  return (
    <ListingDetailItem
      imageAlt={"Image Alt"}
      imageSrc={""}
      title={"Features"}
      subtitle={"Amenities, unit details and additional fees"}
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
