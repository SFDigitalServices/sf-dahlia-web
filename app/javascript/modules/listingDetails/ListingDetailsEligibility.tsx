import React from "react"
import {
  ExpandableText,
  InfoCard,
  ListingDetailItem,
  ListSection,
  t,
} from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { isHabitatListing, isSale } from "../../util/listingUtil"
import { BeforeApplyingForSale, BeforeApplyingType } from "../../components/BeforeApplyingForSale"
import { ListingDetailsPreferences } from "./ListingDetailsPreferences"

export interface ListingDetailsEligibilityProps {
  listing: RailsListing
  imageSrc: string
}

export const ListingDetailsEligibility = ({
  listing,
  imageSrc,
}: ListingDetailsEligibilityProps) => {
  return (
    <ListingDetailItem
      imageAlt={""}
      imageSrc={imageSrc}
      title={t("listings.eligibility.header")}
      subtitle={isSale(listing) ? "" : t("listings.eligibility.subheader")}
      desktopClass="bg-grey-1"
    >
      {isSale(listing) && (
        <BeforeApplyingForSale
          beforeApplyingType={
            isHabitatListing(listing)
              ? BeforeApplyingType.LISTING_DETAILS_HABITAT
              : BeforeApplyingType.LISTING_DETAILS
          }
        />
      )}
      <ListSection
        title={t("listings.householdMaximumIncome")}
        subtitle={t("listings.forIncomeCalculations")}
      >
        {/* TODO: Build unit summaries */}
      </ListSection>
      <ListSection title={t("t.occupancy")} subtitle={t("listings.occupancyDescriptionNoSro")}>
        {/* TODO: Build unit summaries */}
      </ListSection>
      <ListingDetailsPreferences listingID={listing.listingID} />
      <ListSection
        title={t("listingsForRent.rentalAssistance.title")}
        subtitle={t("listingsForRent.rentalAssitance.subtitle")}
      />
      <ListSection
        title={t("listings.additionalEligibilityRules.title")}
        subtitle={t("listings.additionalEligibilityRules.subtitle")}
      >
        {listing.Credit_Rating && (
          <InfoCard title={t("listings.additionalEligibilityRules.creditHistory")}>
            <ExpandableText className="text-sm text-gray-700">
              {listing.Credit_Rating}
            </ExpandableText>
          </InfoCard>
        )}

        {listing.Eviction_History && (
          <InfoCard title={t("listings.additionalEligibilityRules.rentalHistory")}>
            <ExpandableText className="text-sm text-gray-700">
              {listing.Eviction_History}
            </ExpandableText>
          </InfoCard>
        )}

        <InfoCard title={t("listings.additionalEligibilityRules.criminalBackground")}>
          <ExpandableText className="text-sm text-gray-700">
            Qualified applicants with criminal history will be considered for housing in compliance
            with Article 49 of the San Francisco Police Code: Fair Chance Ordinance.
          </ExpandableText>
        </InfoCard>
        <p>
          <a href={listing.Building_Selection_Criteria} target={"_blank"}>
            {t("listings.additionalEligibilityRules.findOutMore")}
          </a>
        </p>
      </ListSection>
    </ListingDetailItem>
  )
}
