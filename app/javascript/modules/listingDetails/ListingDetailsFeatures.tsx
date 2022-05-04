import { RailsListing } from "../listings/SharedHelpers"
import { Description, ListingDetailItem, t, AdditionalFees } from "@bloom-housing/ui-components"
import React from "react"
import { isRental, isSale } from "../../util/listingUtil"

export interface ListingDetailsFeaturesProps {
  listing: RailsListing
  imageSrc: string
}

const getDepositString = (min?: string, max?: string) => {
  if (!min && !max) return null
  if (min && max) return `$${min} - $${max}`
  return min ? `$${min}` : `$${max}`
}

// TBD: if listing is BMR add "may be higher for lower credit scores" string

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
        {isRental(listing) && (
          <AdditionalFees
            deposit={getDepositString(
              listing.Deposit_Min?.toLocaleString(),
              listing.Deposit_Max?.toLocaleString()
            )}
            applicationFee={listing.Fee ? `$${listing.Fee?.toLocaleString()}` : null}
            costsNotIncluded={listing.Costs_Not_Included}
            strings={{
              sectionHeader: t("listings.features.additionalFees"),
              deposit: t("listings.features.deposit"),
              depositSubtext: [t("listings.features.orOneMonthsRent")],
              applicationFee: t("listings.features.applicationFee"),
              applicationFeeSubtext: [
                t("listings.features.perApplicant"),
                t("listings.features.duePostLottery"),
              ],
            }}
          />
        )}
      </div>
    </ListingDetailItem>
  )
}
