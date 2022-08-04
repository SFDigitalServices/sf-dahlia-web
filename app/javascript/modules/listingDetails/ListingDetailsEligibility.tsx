import React from "react"
import {
  ExpandableText,
  InfoCard,
  ListingDetailItem,
  ListSection,
  StandardTable,
  t,
} from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { isHabitatListing, isSale } from "../../util/listingUtil"
import { renderInlineWithInnerHTML } from "../../util/languageUtil"
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
  /* TODO: Implement updated API to get actual data */
  const HMITableHeaders = {
    householdSize: "t.householdSize",
    maxIncomeMonth: "t.maximumIncomeMonth",
    maxIncomeYear: "t.maximumIncomeYear",
  }
  const HMITableData = [
    {
      householdSize: {
        content: <span className="font-semibold">{`1 ${t("listings.person")}`}</span>,
      },
      maxIncomeMonth: { content: t("t.perMonthCost", { cost: "$1,111" }) },
      maxIncomeYear: { content: t("t.perYearCost", { cost: "$51,111" }) },
    },
    {
      householdSize: {
        content: <span className="font-semibold">{`2 ${t("listings.people")}`}</span>,
      },
      maxIncomeMonth: { content: t("t.perMonthCost", { cost: "$1,111" }) },
      maxIncomeYear: { content: t("t.perYearCost", { cost: "$51,111" }) },
    },
    {
      householdSize: {
        content: <span className="font-semibold">{`3 ${t("listings.people")}`}</span>,
      },
      maxIncomeMonth: { content: t("t.perMonthCost", { cost: "$1,111" }) },
      maxIncomeYear: { content: t("t.perYearCost", { cost: "$51,111" }) },
    },
    {
      householdSize: {
        content: <span className="font-semibold">{`4 ${t("listings.people")}`}</span>,
      },
      maxIncomeMonth: { content: t("t.perMonthCost", { cost: "$1,111" }) },
      maxIncomeYear: { content: t("t.perYearCost", { cost: "$51,111" }) },
    },
  ]

  const occupancyTableHeaders = {
    unitType: "t.unitType",
    occupancy: "t.occupancy",
  }
  const occupancyTableData = listing.unitSummaries.general.map((unit) => ({
    unitType: {
      content: <span className="font-semibold">{t(`listings.unitTypes.${unit.unitType}`)}</span>,
    },
    occupancy: { content: `${unit.minOccupancy}-${unit.maxOccupancy} ${t("listings.people")}` },
  }))
  return (
    <ListingDetailItem
      imageAlt={""}
      imageSrc={imageSrc}
      title={t("listings.eligibility.header")}
      subtitle={isSale(listing) ? "" : t("listings.eligibility.subheader")}
      desktopClass="bg-primary-lighter"
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
        subtitle={
          <div>
            <p className="mb-4">{renderInlineWithInnerHTML(t("listings.forIncomeCalculations"))}</p>
            <p className="mb-4">
              {renderInlineWithInnerHTML(t("listings.incomeExceptions.intro"))}
            </p>
            <ul className="list-disc ml-5">
              <li>{t("listings.incomeExceptions.students")}</li>
              <li>{t("listings.incomeExceptions.nontaxable")}</li>
            </ul>
          </div>
        }
      >
        <StandardTable headers={HMITableHeaders} data={HMITableData} />
      </ListSection>
      <ListSection title={t("t.occupancy")} subtitle={t("listings.occupancyDescriptionNoSro")}>
        <StandardTable headers={occupancyTableHeaders} data={occupancyTableData} />
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
