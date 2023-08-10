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
  isRental,
  isSale,
  listingHasOnlySROUnits,
  listingHasSROUnits,
} from "../../util/listingUtil"
import { defaultIfNotTranslated, renderMarkup } from "../../util/languageUtil"
import { BeforeApplyingForSale, BeforeApplyingType } from "../../components/BeforeApplyingForSale"
import { ListingDetailsPreferences } from "./ListingDetailsPreferences"
import RailsUnit from "../../api/types/rails/listings/RailsUnit"
import ErrorBoundary, { BoundaryScope } from "../../components/ErrorBoundary"
import { ListingDetailsHMITable } from "./ListingDetailsHMITable"
import "./ListingDetailsEligibility.scss"

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
  const isAllSRO = listingHasOnlySROUnits(listing)
  const isSomeSRO = listingHasSROUnits(listing)
  const priorityUnits = []

  listing.Units?.forEach((unit: RailsUnit) => {
    const priorityUnit = priorityUnits?.find((priorityUnit: ReducedUnit) => {
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
      occupancyLabel = t("listings.onePerson")
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
      <ul>
        {isSale(listing) && (
          <BeforeApplyingForSale
            beforeApplyingType={
              isHabitatListing(listing)
                ? BeforeApplyingType.LISTING_DETAILS_HABITAT
                : BeforeApplyingType.LISTING_DETAILS
            }
          />
        )}
        {!!listing.Reserved_community_type && !isHabitatListing(listing) && (
          <ListSection
            title={t(`listings.reservedCommunityType.${listing.Reserved_community_type}.title`)}
            subtitle={""}
          >
            <InfoCard
              title={t(
                `listings.reservedCommunityType.${listing.Reserved_community_type}.eligibility`
              )}
              subtitle={t("listings.allUnits")}
            >
              {listing.Reserved_community_type_Description && (
                <div className="text-gray-700 text-xs translate">
                  {renderMarkup(listing.Reserved_community_type_Description)}
                </div>
              )}
            </InfoCard>
          </ListSection>
        )}
        {!isHabitatListing(listing) && <ListingDetailsHMITable listing={listing} />}
        <ListSection title={t("t.occupancy")} subtitle={occupancySubtitle}>
          <StandardTable headers={occupancyTableHeaders} data={occupancyTableData} />
        </ListSection>

        <ListSection
          title={t("listings.lottery.title")}
          subtitle={t("listings.lottery.preferences")}
        >
          <ErrorBoundary boundaryScope={BoundaryScope.component}>
            <ListingDetailsPreferences listingID={listing.listingID} />
          </ErrorBoundary>
        </ListSection>
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
                    key={unit.name}
                    title={defaultIfNotTranslated(`listings.${unit.name}.title`, unit.name)}
                    subtitle={
                      unit.numberOfUnits === 1
                        ? `${unit.numberOfUnits} ${defaultIfNotTranslated(
                            "listings.features.unit",
                            "unit"
                          )}`
                        : `${unit.numberOfUnits} ${defaultIfNotTranslated("t.units", "units")}`
                    }
                  >
                    <p className="text-sm text-gray-700">
                      {defaultIfNotTranslated(
                        `listings.unitsHaveAccessibilityFeaturesFor.${unit.name}`,
                        `These units have accessibility features for people with ${unit.name}.`
                      )}
                    </p>
                  </InfoCard>
                )
              })}
          </ListSection>
        ) : (
          <></>
        )}
        {isRental(listing) && (
          <ListSection
            title={t("listingsForRent.rentalAssistance.title")}
            subtitle={t("listingsForRent.rentalAssitance.subtitle")}
          />
        )}
        {(listing.Credit_Rating || listing.Eviction_History || listing.Criminal_History) && (
          <ListSection
            title={t("listings.additionalEligibilityRules.title")}
            subtitle={t("listings.additionalEligibilityRules.subtitle")}
          >
            {listing.Credit_Rating && (
              <InfoCard title={t("listings.additionalEligibilityRules.creditHistory")}>
                <ExpandableText
                  className="text-xs text-gray-700 translate"
                  strings={{
                    readMore: t("label.more"),
                    readLess: t("label.less"),
                    buttonAriaLabel: t("listings.eligibility.guidelines.creditHistory"),
                  }}
                  buttonClassName="mt-2"
                >
                  {listing.Credit_Rating}
                </ExpandableText>
              </InfoCard>
            )}

            {listing.Eviction_History && (
              <InfoCard title={t("listings.additionalEligibilityRules.rentalHistory")}>
                <ExpandableText
                  className="text-xs text-gray-700 translate"
                  strings={{
                    readMore: t("label.more"),
                    readLess: t("label.less"),
                    buttonAriaLabel: t("listings.eligibility.guidelines.rentalHistory"),
                  }}
                  buttonClassName="mt-2"
                >
                  {listing.Eviction_History}
                </ExpandableText>
              </InfoCard>
            )}
            <InfoCard title={t("listings.additionalEligibilityRules.criminalBackground")}>
              <ExpandableText
                className="text-xs text-gray-700"
                strings={{
                  readMore: t("label.more"),
                  readLess: t("label.less"),
                  buttonAriaLabel: t("listings.eligibility.guidelines.criminalBackground"),
                }}
                maxLength={600}
              >
                {t("listings.additionalEligibilityRules.criminalBackgroundInfo", {
                  fairChanceUrl: "https://sfgov.org/olse/fair-chance-ordinance-fco",
                  article49Url:
                    "https://sfgov.org/olse/sites/default/files/FileCenter/Documents/12136-FCO%20FAQs%20Final.pdf",
                })}
              </ExpandableText>
            </InfoCard>

            {listing.Building_Selection_Criteria && (
              <p>
                <a
                  href={listing.Building_Selection_Criteria}
                  target={"_blank"}
                  className="md:text-blue-700"
                >
                  {t("listings.additionalEligibilityRules.findOutMore")}
                </a>
              </p>
            )}
          </ListSection>
        )}
      </ul>
    </ListingDetailItem>
  )
}
