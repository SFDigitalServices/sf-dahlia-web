import React from "react"
import { RailsListing } from "../listings/SharedHelpers"
import { AdditionalFees, Description, ListingDetailItem, t } from "@bloom-housing/ui-components"
import { isBMR, isRental, isSale } from "../../util/listingUtil"
import { stripMostTags } from "../../util/filterUtil"

export interface ListingDetailsFeaturesProps {
  listing: RailsListing
  imageSrc: string
}

const getDepositString = (min?: string, max?: string) => {
  if (!min && !max) return null
  if (min && max) return `$${min} - $${max}`
  return min ? `$${min}` : `$${max}`
}

// TODO: add prop for items that should have machine translated content
interface FeatureItemProps {
  content: any
  title: string
}
const FeatureItem = ({ content, title }: FeatureItemProps) => {
  if (!content) return <></>

  return (
    <Description
      term={title}
      description={stripMostTags(content)}
      markdown={true}
      dtClassName="translate"
    />
  )
}

export const ListingDetailsFeatures = ({ listing, imageSrc }: ListingDetailsFeaturesProps) => {
  const depositSubtext = [t("listings.features.orOneMonthsRent")]

  if (isBMR(listing)) {
    depositSubtext.push(t("listings.features.mayBeHigherForLowerCreditScores"))
  }

  return (
    <ListingDetailItem
      imageAlt={""}
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
          <FeatureItem content={listing.Neighborhood} title={t("listings.neighborhood.header")} />
          <FeatureItem content={String(listing.Year_Built)} title={t("listings.features.built")} />
          <FeatureItem content={listing.Appliances} title={t("listings.features.appliances")} />
          <FeatureItem
            content={listing.Services_Onsite}
            title={t(
              isSale(listing)
                ? "listings.features.servicesCoveredByHoaDues"
                : "listings.features.servicesOnsite"
            )}
          />
          <FeatureItem
            content={listing.Parking_Information}
            title={t("listings.features.parking")}
          />
          <FeatureItem
            content={listing.Smoking_Policy}
            title={t("listings.features.smokingPolicy")}
          />
          <FeatureItem content={listing.Pet_Policy} title={t("listings.features.petsPolicy")} />
          <FeatureItem
            content={listing.Amenities}
            title={t("listings.features.propertyAmenities")}
          />
          <FeatureItem
            content={listing.Accessibility}
            title={t("listings.features.accessibility")}
          />

          <Description term={t("listings.features.unitFeatures")} description={""} />
        </dl>
        {isRental(listing) && (
          <AdditionalFees
            deposit={getDepositString(
              listing.Deposit_Min?.toLocaleString(),
              listing.Deposit_Max?.toLocaleString()
            )}
            applicationFee={listing.Fee ? `$${listing.Fee.toFixed(2)?.toLocaleString()}` : null}
            footerContent={[listing.Costs_Not_Included]}
            strings={{
              sectionHeader: t("listings.features.additionalFees"),
              deposit: t("listings.features.deposit"),
              depositSubtext: depositSubtext,
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
