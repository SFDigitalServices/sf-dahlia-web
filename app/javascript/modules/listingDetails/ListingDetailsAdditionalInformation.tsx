import React from "react"
import { LinkButton, ListingDetailItem, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { TextTruncate } from "../../components/TextTruncate"
import { isHabitatListing, isSale } from "../../util/listingUtil"

export interface ListingDetailsAdditionalInformationProps {
  listing: RailsListing
  imageSrc: string
}

export const ListingDetailsAdditionalInformation = ({
  listing,
  imageSrc,
}: ListingDetailsAdditionalInformationProps) => {
  const getCommissionString = () => {
    return listing.Realtor_Commission_Unit === "percent"
      ? t("listings.realtorCommissionPercentage", {
          percentage: listing.Realtor_Commission_Amount,
        })
      : `$${listing.Realtor_Commission_Amount.toLocaleString()}`
  }

  return (
    <ListingDetailItem
      imageAlt={""}
      imageSrc={imageSrc}
      title={t("listings.additionalInformation.header")}
      subtitle={t("listings.additionalInformation.subheader")}
    >
      <div className="listing-detail-panel">
        {listing.Listing_Other_Notes && (
          <div className="info-card bg-gray-100 border-0">
            <h3 className="text-serif-lg">{t("listings.specialNotes")}</h3>
            <TextTruncate
              className="primary-lighter-markup-link translate"
              buttonClassName="text-blue-700"
              text={listing.Listing_Other_Notes}
            />
          </div>
        )}
        {(!!listing.Required_Documents || isSale(listing)) && (
          <div className="info-card bg-gray-100 border-0">
            <h3 className="text-serif-lg">{t("listings.requiredDocuments")}</h3>
            <div className="text-sm">
              <TextTruncate
                className="primary-lighter-markup-link translate"
                buttonClassName="text-blue-700"
                text={listing.Required_Documents}
              />
            </div>
            {isSale(listing) && !isHabitatListing(listing) && (
              <div className="text-sm mt-4">
                <TextTruncate
                  className="primary-lighter-markup-link translate"
                  buttonClassName="text-blue-700"
                  text={t("listings.requiredDocumentsAfterApplying", {
                    url: "https://sfmohcd.org/after-homebuyer-lottery",
                  })}
                />
              </div>
            )}
          </div>
        )}
        {listing.Legal_Disclaimers && (
          <div className="info-card bg-gray-100 border-0">
            <h3 className="text-serif-lg">{t("listings.importantProgramRules")}</h3>
            <div className="text-sm">
              <TextTruncate
                text={listing.Legal_Disclaimers}
                className="primary-lighter-markup-link translate"
                buttonClassName="text-blue-700"
              />
            </div>
          </div>
        )}
        {listing.CC_and_R_URL && (
          <div className="info-card bg-gray-100 border-0">
            <h3 className="text-serif-lg">{t("listings.cc&r")}</h3>
            <div className="text-sm">
              <TextTruncate
                className="primary-lighter-markup-link translate"
                buttonClassName="text-blue-700"
                text={t("listings.cc&rDescription")}
              />
              <LinkButton href={listing.CC_and_R_URL} className={"mt-4"} newTab={true}>
                {t("listings.downloadPdf")}
              </LinkButton>
            </div>
          </div>
        )}
        {isSale(listing) && (
          <div className="info-card bg-gray-100 border-0">
            <h3 className="text-serif-lg">{t("listings.realtorCommission")}</h3>
            <div className="text-sm">
              {listing.Allows_Realtor_Commission ? (
                <>
                  <span className={"font-bold"}>{t("listings.realtorCommissionHeader")}</span>
                  {getCommissionString()}
                </>
              ) : (
                t("listings.realtorCommissionNotEligible")
              )}
              {listing.Realtor_Commission_Info && (
                <div className={"mt-4"}>
                  <span className={"font-bold"}>{t("listings.realtorCommissionHowTo")}</span>
                  <span>
                    <TextTruncate
                      className="primary-lighter-markup-link translate"
                      buttonClassName="text-blue-700"
                      text={listing.Realtor_Commission_Info}
                    />
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        {/* TODO: implement once we've established needs for sales listings
              {listing.isSale && (
                <div className="info-card bg-gray-100 border-0">
                  <h3 className="text-serif-lg">For the Buyer's Realtor</h3>
                  {listing.Allows_Realtor_Commission ? (
                    display realtor_commission_header
                    realtorComissionMessage
                    {listing.Realtor_Commission_Info && realtor_commission_how_to}
                  ) : display realtor_commission_not_eligible message}
                </div>
              )}
            */}
        {listing.Repricing_Mechanism && (
          <div className="info-card bg-gray-100 border-0">
            <h3 className="text-serif-lg">{t("listings.rePricing")}</h3>
            <div className="text-sm">
              <TextTruncate
                className="primary-lighter-markup-link translate"
                buttonClassName="text-blue-700"
                text={listing.Repricing_Mechanism}
              />
            </div>
          </div>
        )}
      </div>
    </ListingDetailItem>
  )
}
