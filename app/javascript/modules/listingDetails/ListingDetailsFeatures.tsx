import React from "react"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailsUnitAccordions } from "./ListingDetailsUnitAccordions"
import { AdditionalFees, Description, ListingDetailItem, t } from "@bloom-housing/ui-components"
import { isBMR, isRental, isSale } from "../../util/listingUtil"
import { stripMostTags } from "../../util/filterUtil"
import { isValidUrl } from "../../util/urlUtil"
import ErrorBoundary, { BoundaryScope } from "../../components/ErrorBoundary"
import { renderMarkup } from "../../util/languageUtil"

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
  content: string
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

interface UnitDetailsFeatureItemProps {
  pricingMatrixUrl: string
}
const UnitDetailsFeatureItem = ({ pricingMatrixUrl }: UnitDetailsFeatureItemProps) => {
  const hyperlink = isValidUrl(pricingMatrixUrl)
    ? `<a href='${pricingMatrixUrl}' target="_blank">${t(
        "listings.features.downloadPriceAndIncomeLimitForEachUnitPdf"
      )}</a>`
    : ""

  return (
    <>
      <Description
        term={t("listings.features.unitDetails")}
        description={hyperlink}
        markdownProps={{
          disableParsingRawHTML: false,
        }}
        markdown={true}
      />
      <Description term="" description="" />
    </>
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
          {isRental(listing) && (
            <FeatureItem
              content={listing.Utilities}
              title={t("listings.features.utilities")}
              toTranslate={true}
            />
          )}
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

          {isRental(listing) && (
            <Description term={t("listings.features.unitFeatures")} description={""} />
          )}
          {isSale(listing) && <UnitDetailsFeatureItem pricingMatrixUrl={listing.Pricing_Matrix} />}
        </dl>
        <ErrorBoundary boundaryScope={BoundaryScope.component}>
          <ListingDetailsUnitAccordions />
        </ErrorBoundary>
        {isRental(listing) && (
          <AdditionalFees
            deposit={getDepositString(
              listing.Deposit_Min?.toLocaleString(),
              listing.Deposit_Max?.toLocaleString()
            )}
            applicationFee={listing.Fee ? `$${listing.Fee.toFixed(2)?.toLocaleString()}` : null}
            footerContent={[
              <span className="translate">{renderMarkup(listing.Costs_Not_Included)}</span>,
            ]}
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
