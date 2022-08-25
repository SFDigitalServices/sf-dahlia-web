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
import { renderMarkup, defaultIfNotTranslated } from "../../util/languageUtil"
import { BeforeApplyingForSale, BeforeApplyingType } from "../../components/BeforeApplyingForSale"
import { ListingDetailsPreferences } from "./ListingDetailsPreferences"
import RailsUnit from "../../api/types/rails/listings/RailsUnit"

export interface ListingDetailsEligibilityProps {
  listing: RailsListing
  imageSrc: string
}

export interface ReducedUnit {
  name: string
  numberOfUnits: number
}

export const ListingDetailsEligibility = ({
  listing,
  imageSrc,
}: ListingDetailsEligibilityProps) => {
  const priorityUnits = []

  listing.Units.forEach((unit: RailsUnit) => {
    const priorityUnit = priorityUnits.find((priorityUnit: ReducedUnit) => {
      return priorityUnit.name === unit.Priority_Type
    })

    if (unit.Priority_Type && !priorityUnit) {
      priorityUnits.push({
        name: unit.Priority_Type,
        numberOfUnits: 1,
      })
    }

    if (unit.Priority_Type && priorityUnit) {
      priorityUnit.numberOfUnits++
    }
  })

  const priorityLabelMap = {
    "Mobility impairments": {
      titleTranslation: "listings.prioritiesDescriptor.mobility",
      description: "impaired mobility",
    },
    "Hearing/Vision impairments": {
      titleTranslation: "listings.prioritiesDescriptor.hearingVision",
      description: "impaired vision and/or hearing",
    },
    "Hearing impairments": {
      titleTranslation: "listings.prioritiesDescriptor.hearing",
      description: "impaired hearing",
    },
    "Mobility/Hearing/Vision impairments": {
      titleTranslation: "listings.prioritiesDescriptor.mobilityHearingVision",
      description: "impaired mobility, hearing and/or vision",
    },
    "Vision impairments": {
      titleTranslation: "listings.prioritiesDescriptor.vision",
      description: "impaired vision",
    },
    "Hearing/Vision (Communication)": {
      titleTranslation: "listings.prioritiesDescriptor.hearingVisionCommunication",
      description: "impaired hearing and/or vision (communication)",
    },
  }

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
      <ListSection title={t("t.occupancy")} subtitle={t("listings.occupancyDescriptionNoSro")}>
        <StandardTable headers={occupancyTableHeaders} data={occupancyTableData} />
      </ListSection>
      <ListingDetailsPreferences listingID={listing.listingID} />
      {priorityUnits?.length > 0 ? (
        <ListSection
          title={t("listings.priorityUnits")}
          subtitle={t("listings.priorityUnitsDescription")}
        >
          {priorityUnits
            .filter((unit: ReducedUnit) => {
              return unit?.name !== "Adaptable"
            })
            .map((unit: ReducedUnit) => {
              return (
                <InfoCard
                  title={defaultIfNotTranslated(
                    priorityLabelMap[unit?.name]?.titleTranslation,
                    unit.name
                  )}
                  subtitle={
                    unit.numberOfUnits === 1
                      ? `${unit.numberOfUnits} ${defaultIfNotTranslated(
                          "listings.features.unit",
                          "unit"
                        )}`
                      : `${unit.numberOfUnits} ${defaultIfNotTranslated("t.units", "units")}`
                  }
                >
                  {defaultIfNotTranslated(
                    "listings.unitsHaveAccessibilityFeaturesFor",
                    `These units have accessibility features for people with ${unit.name}.`,
                    {
                      type: priorityLabelMap[unit?.name]?.description || unit.name,
                    }
                  )}
                </InfoCard>
              )
            })}
        </ListSection>
      ) : (
        <></>
      )}
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
