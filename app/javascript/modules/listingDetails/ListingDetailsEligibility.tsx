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
import { renderInlineWithInnerHTML, defaultIfNotTranslated } from "../../util/languageUtil"
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
      descriptionTranslation: "listings.prioritiesDescriptor.mobilityDescription",
    },
    "Hearing/Vision impairments": {
      titleTranslation: "listings.prioritiesDescriptor.hearingVision",
      descriptionTranslation: "listings.prioritiesDescriptor.hearingVisionDescription",
    },
    "Hearing impairments": {
      titleTranslation: "listings.prioritiesDescriptor.hearing",
      descriptionTranslation: "listings.prioritiesDescriptor.hearingDescription",
    },
    "Mobility/hearing/vision impairments": {
      titleTranslation: "listings.prioritiesDescriptor.mobilityHearingVision",
      descriptionTranslation: "listings.prioritiesDescriptor.mobilityHearingVisionDescription",
    },
    "Vision impairments": {
      titleTranslation: "listings.prioritiesDescriptor.vision",
      descriptionTranslation: "listings.prioritiesDescriptor.visionDescription",
    },
    "Hearing/Vision (Communication)": {
      titleTranslation: "listings.prioritiesDescriptor.hearingVisionCommunication",
      descriptionTranslation: "listings.prioritiesDescriptor.hearingVisionCommunicationDescription",
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
            <p className="mb-4">{renderInlineWithInnerHTML(t("listings.forIncomeCalculations"))}</p>
            <p className="mb-4">
              {renderInlineWithInnerHTML(
                t("listings.incomeExceptions.intro", {
                  url: "https://sfmohcd.org/special-calculations-household-income",
                })
              )}
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
        title={t("listings.priorityUnits")}
        subtitle={t("listings.priorityUnitsDescription")}
      >
        {priorityUnits?.length > 0 ? (
          priorityUnits
            .filter((unit: ReducedUnit) => {
              return unit?.name !== "Adaptable"
            })
            .map((unit: ReducedUnit) => {
              return (
                <InfoCard
                  title={
                    priorityLabelMap[unit?.name]
                      ? defaultIfNotTranslated(
                          priorityLabelMap[unit?.name]?.titleTranslation,
                          unit.name
                        )
                      : unit?.name
                  }
                  subtitle={
                    unit.numberOfUnits === 1
                      ? `${unit.numberOfUnits} ${defaultIfNotTranslated(
                          "listings.features.unit",
                          "unit"
                        )}`
                      : `${unit.numberOfUnits} ${defaultIfNotTranslated("t.units", "units")}`
                  }
                >
                  {priorityLabelMap[unit.name]
                    ? defaultIfNotTranslated(
                        priorityLabelMap[unit.name]?.descriptionTranslation,
                        `These units have accessibility features for people with ${unit.name}.`
                      )
                    : defaultIfNotTranslated(
                        "listings.unitsHaveAccessibilityFeaturesFor",
                        `These units have accessibility features for people with ${unit.name}.`,
                        {
                          type: unit.name,
                        }
                      )}
                </InfoCard>
              )
            })
        ) : (
          <></>
        )}
      </ListSection>
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
