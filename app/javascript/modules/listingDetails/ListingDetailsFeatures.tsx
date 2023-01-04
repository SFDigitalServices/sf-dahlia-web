import React, { useEffect, useState } from "react"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailsUnitAccordion } from "./ListingDetailsUnitAccordion"
import {
  AdditionalFees,
  Description,
  Icon,
  ListingDetailItem,
  t,
} from "@bloom-housing/ui-components"
import { getUnits } from "../../api/listingApiService"
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
  toTranslate?: boolean
}
const FeatureItem = ({ content, title, toTranslate }: FeatureItemProps) => {
  if (!content) return <></>

  return (
    <Description
      term={title}
      description={stripMostTags(content)}
      markdownProps={{
        disableParsingRawHTML: false,
      }}
      markdown={true}
      dtClassName={toTranslate && "translate"}
    />
  )
}

export const ListingDetailsFeatures = ({ listing, imageSrc }: ListingDetailsFeaturesProps) => {
  const [units, setUnits] = useState({})

  useEffect(() => {
    void getUnits(listing.Id).then((units) => {
      // eslint-disable-next-line unicorn/no-array-reduce
      const sortedUnits = units.reduce((acc, unit) => {
        if (!acc[unit.Unit_Type]) {
          acc = {
            ...acc,
            [unit.Unit_Type]: {},
          }
        }
        acc[unit.Unit_Type].units = [...(acc[unit.Unit_Type]?.units || []), unit]

        if (!acc[unit.Unit_Type].availability) acc[unit.Unit_Type].availability = 0
        acc[unit.Unit_Type].availability += unit.Availability

        if (!acc[unit.Unit_Type].minSqFt && !acc[unit.Unit_Type].maxSqFt) {
          acc[unit.Unit_Type].minSqFt = unit.Unit_Square_Footage
          acc[unit.Unit_Type].maxSqFt = unit.Unit_Square_Footage
        }
        if (unit.Unit_Square_Footage < acc[unit.Unit_Type].minSqFt) {
          acc[unit.Unit_Type].minSqFt = unit.Unit_Square_Footage
        }
        if (unit.Unit_Square_Footage > acc[unit.Unit_Type].maxSqFt) {
          acc[unit.Unit_Type].maxSqFt = unit.Unit_Square_Footage
        }
        return acc
      }, {})
      setUnits(sortedUnits)
    })
    return () => {
      setUnits([])
    }
  }, [listing.Id])

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
          <FeatureItem
            content={listing.Neighborhood}
            title={t("listings.neighborhood.header")}
            toTranslate={false}
          />
          <FeatureItem
            content={String(listing.Year_Built)}
            title={t("listings.features.built")}
            toTranslate={false}
          />
          <FeatureItem
            content={listing.Appliances}
            title={t("listings.features.appliances")}
            toTranslate={true}
          />
          <FeatureItem
            content={listing.Services_Onsite}
            title={t(
              isSale(listing)
                ? "listings.features.servicesCoveredByHoaDues"
                : "listings.features.servicesOnsite"
            )}
            toTranslate={true}
          />
          <FeatureItem
            content={listing.Parking_Information}
            title={t("listings.features.parking")}
            toTranslate={true}
          />
          <FeatureItem
            content={listing.Smoking_Policy}
            title={t("listings.features.smokingPolicy")}
            toTranslate={true}
          />
          <FeatureItem
            content={listing.Pet_Policy}
            title={t("listings.features.petsPolicy")}
            toTranslate={true}
          />
          <FeatureItem
            content={listing.Amenities}
            title={t("listings.features.propertyAmenities")}
            toTranslate={true}
          />
          <FeatureItem
            content={listing.Accessibility}
            title={t("listings.features.accessibility")}
            toTranslate={true}
          />

          <Description term={t("listings.features.unitFeatures")} description={""} />
        </dl>
        {Object.keys(units).length > 0 ? (
          Object.keys(units).map((unitType) => (
            <ListingDetailsUnitAccordion
              key={unitType}
              unitType={unitType}
              unitGroup={units[unitType]}
            />
          ))
        ) : (
          <div className="flex justify-center">
            <Icon symbol="spinner" size="large" />
          </div>
        )}
        {isRental(listing) && (
          <AdditionalFees
            deposit={getDepositString(
              listing.Deposit_Min?.toLocaleString(),
              listing.Deposit_Max?.toLocaleString()
            )}
            applicationFee={listing.Fee ? `$${listing.Fee.toFixed(2)?.toLocaleString()}` : null}
            footerContent={[<p className="translate">{listing.Costs_Not_Included}</p>]}
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
