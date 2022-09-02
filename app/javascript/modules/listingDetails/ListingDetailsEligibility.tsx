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
import {
  isHabitatListing,
  isPluralSRO,
  isSale,
  listingHasOnlySROUnits,
  listingHasSROUnits,
} from "../../util/listingUtil"
import { renderMarkup } from "../../util/languageUtil"
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
  const isAllSRO = listingHasOnlySROUnits(listing)
  const isSomeSRO = listingHasSROUnits(listing)

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

  let occupancySubtitle = ""
  if (isSale(listing)) {
    occupancySubtitle = t("listings.occupancyDescriptionMinOne")
  } else if (
    isAllSRO &&
    !(isPluralSRO("1335 Folsom Street", listing) || isPluralSRO("750 Harrison", listing))
  ) {
    occupancySubtitle = t("listings.occupancyDescriptionAllSro")
  } else if (isPluralSRO("1335 Folsom Street", listing) || isPluralSRO("750 Harrison", listing)) {
    occupancySubtitle = t("listings.occupancyDescriptionAllSroPlural", { numberOfPeople: "2" })
  } else if (!isAllSRO && isSomeSRO) {
    occupancySubtitle = t("listings.occupancyDescriptionSomeSro")
  } else {
    occupancySubtitle = t("listings.occupancyDescriptionNoSro")
  }

  const occupancyTableHeaders = {
    unitType: "t.unitType",
    occupancy: "t.occupancy",
  }
  const occupancyTableData = listing.unitSummaries.general.map((unit) => {
    let occupancyLabel = ""
    if (unit.maxOccupancy === 1) {
      occupancyLabel = `1 ${t("listings.person")}`
    } else if (unit.minOccupancy && unit.maxOccupancy) {
      occupancyLabel = t("listings.minMaxPeople", {
        min: unit.minOccupancy,
        max: unit.maxOccupancy,
      })
    } else if (unit.minOccupancy && !unit.maxOccupancy) {
      occupancyLabel = t("listings.minPeople", { num: unit.minOccupancy })
    }
    return {
      unitType: {
        content: <span className="font-semibold">{t(`listings.unitTypes.${unit.unitType}`)}</span>,
      },
      occupancy: {
        content: occupancyLabel,
      },
    }
  })
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
            <div className="mb-4">{renderMarkup(t("listings.forIncomeCalculations"))}</div>
            <div className="mb-4">
              {renderMarkup(
                t("listings.incomeExceptions.intro", {
                  url: "https://sfmohcd.org/special-calculations-household-income",
                })
              )}
            </div>
            <ul className="list-disc ml-5">
              <li>{t("listings.incomeExceptions.students")}</li>
              <li>{t("listings.incomeExceptions.nontaxable")}</li>
            </ul>
          </div>
        }
      >
        <StandardTable headers={HMITableHeaders} data={HMITableData} />
      </ListSection>
      <ListSection title={t("t.occupancy")} subtitle={occupancySubtitle}>
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
            <ExpandableText
              className="text-sm text-gray-700"
              strings={{ readMore: t("label.more"), readLess: t("label.less") }}
            >
              {listing.Credit_Rating}
            </ExpandableText>
          </InfoCard>
        )}

        {listing.Eviction_History && (
          <InfoCard title={t("listings.additionalEligibilityRules.rentalHistory")}>
            <ExpandableText
              className="text-sm text-gray-700"
              strings={{ readMore: t("label.more"), readLess: t("label.less") }}
            >
              {listing.Eviction_History}
            </ExpandableText>
          </InfoCard>
        )}

        <InfoCard title={t("listings.additionalEligibilityRules.criminalBackground")}>
          <ExpandableText
            className="text-sm text-gray-700"
            strings={{ readMore: t("label.more"), readLess: t("label.less") }}
            maxLength={600}
          >
            {t("listings.additionalEligibilityRules.criminalBackgroundInfo", {
              fairChanceUrl: "https://sfgov.org/olse/fair-chance-ordinance-fco",
              article49Url:
                "https://sfgov.org/olse/sites/default/files/FileCenter/Documents/12136-FCO%20FAQs%20Final.pdf",
            })}
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
