import React from "react"
import {
  ExpandableText,
  InfoCard,
  ListingDetailItem,
  ListSection,
  PreferencesList,
  t,
} from "@bloom-housing/ui-components"
import { isSale, RailsListing } from "../listings/SharedHelpers"

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
      desktopClass="bg-primary-lighter"
    >
      <ListSection
        title={"Household Maximum Income"}
        subtitle={
          "For income calculations, household size includes everyone (all ages) living in the unit."
        }
      >
        {/* TODO: Build unit summaries */}
      </ListSection>
      <ListSection
        title={"Occupancy"}
        subtitle={
          "Occupancy limits for this building differ from household size, and do not include children under 6."
        }
      >
        {/* TODO: Build unit summaries */}
      </ListSection>
      <ListSection
        title={"Lottery Preferences"}
        subtitle={
          "Anyone may enter the housing lottery for this listing. If your household has one of the following preferences, you will be considered in the order shown here. Each preference holder will be reviewed in lottery rank order."
        }
      >
        <>
          <PreferencesList
            listingPreferences={listing.Listing_Lottery_Preferences.map((preference, index) => {
              return {
                title: preference.Lottery_Preference.Name,
                subtitle: `Up to ${preference.Available_Units} unit(s) available`,
                ordinal: index + 1,
              }
            })}
          />
          <p className="text-gray-700 text-tiny">
            {
              "After all preference holders have been considered, any remaining units will be available to qualified applicants in lottery order."
            }
          </p>
        </>
      </ListSection>
      <ListSection
        title={"Rental Assistance"}
        subtitle={
          "Section 8 housing vouchers and other valid rental assistance programs can be used for this property. In the case of a valid rental subsidy, the required minimum income will be based on the portion of the rent that the tenant pays after use of the subsidy."
        }
      />
      <ListSection
        title={"Additional Eligibility Rules"}
        subtitle={"Applicants must also qualify under the rules of the building."}
      >
        {listing.Credit_Rating && (
          <InfoCard title={"Credit History"}>
            <ExpandableText className="text-sm text-gray-700">
              {listing.Credit_Rating}
            </ExpandableText>
          </InfoCard>
        )}

        {listing.Eviction_History && (
          <InfoCard title={"Rental History"}>
            <ExpandableText className="text-sm text-gray-700">
              {listing.Eviction_History}
            </ExpandableText>
          </InfoCard>
        )}

        <InfoCard title={"Criminal Background"}>
          <ExpandableText className="text-sm text-gray-700">
            Qualified applicants with criminal history will be considered for housing in compliance
            with Article 49 of the San Francisco Police Code: Fair Chance Ordinance.
          </ExpandableText>
        </InfoCard>
        <p>
          <a href={listing.Building_Selection_Criteria} target={"_blank"}>
            {"Find out more about Building Selection Criteria"}
          </a>
        </p>
      </ListSection>
    </ListingDetailItem>
  )
}
