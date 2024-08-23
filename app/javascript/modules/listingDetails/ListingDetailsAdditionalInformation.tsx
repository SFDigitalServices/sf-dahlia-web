import React from "react"
import { LinkButton, ListingDetailItem, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { TextTruncate } from "../../components/TextTruncate"
import { isHabitatListing, isSale } from "../../util/listingUtil"
import { stripMostTags } from "../../util/filterUtil"
import { getTranslatedString } from "../../util/languageUtil"

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
            <h3 className="text-serif-xl">{t("listings.specialNotes")}</h3>
            <TextTruncate
              className="primary-lighter-markup-link translate"
              buttonClassName="text-blue-700"
              text={stripMostTags(
                getTranslatedString(
                  listing.Listing_Other_Notes,
                  "Listing_Other_Notes",
                  listing.translations
                )
              )}
            />
          </div>
        )}
        {(!!listing.Required_Documents || isSale(listing)) && (
          <div className="info-card bg-gray-100 border-0">
            <h3 className="text-serif-xl">{t("listings.requiredDocuments")}</h3>
            <div className="text-xs">
              <TextTruncate
                className="primary-lighter-markup-link translate"
                buttonClassName="text-blue-700"
                text={stripMostTags(
                  getTranslatedString(
                    listing.Required_Documents,
                    "Required_Documents",
                    listing.translations
                  )
                )}
              />
            </div>
            {isSale(listing) && !isHabitatListing(listing) && (
              <div className="text-xs mt-4">
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
            <h3 className="text-serif-xl">{t("listings.importantProgramRules")}</h3>
            <div className="text-xs">
              <TextTruncate
                text={stripMostTags(
                  getTranslatedString(
                    listing.Legal_Disclaimers,
                    "Legal_Disclaimers",
                    listing.translations
                  )
                )}
                className="primary-lighter-markup-link translate"
                buttonClassName="text-blue-500"
              />
            </div>
          </div>
        )}
        {listing.CC_and_R_URL && (
          <div className="info-card bg-gray-100 border-0">
            <h3 className="text-serif-xl">{t("listings.cc&r")}</h3>
            <div className="text-xs">
              <TextTruncate
                className="primary-lighter-markup-link translate"
                buttonClassName="text-blue-500"
                text={t("listings.cc&rDescription")}
              />
              <br />
              <LinkButton href={listing.CC_and_R_URL} className={"mt-4"} newTab={true}>
                {t("listings.downloadPdf")}
              </LinkButton>
            </div>
          </div>
        )}
        {isSale(listing) && (
          <div className="info-card bg-gray-100 border-0">
            <h3 className="text-serif-xl">{t("listings.realtorCommission")}</h3>
            <div className="text-xs">
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
                      buttonClassName="text-blue-500"
                      text={stripMostTags(
                        getTranslatedString(
                          listing.Realtor_Commission_Info,
                          "Realtor_Commission_Info",
                          listing.translations
                        )
                      )}
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
                  <h3 className="text-serif-xl">For the Buyer's Realtor</h3>
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
            <h3 className="text-serif-xl">{t("listings.rePricing")}</h3>
            <div className="text-xs">
              <TextTruncate
                className="primary-lighter-markup-link translate"
                buttonClassName="text-blue-500"
                text={stripMostTags(
                  getTranslatedString(
                    listing.Repricing_Mechanism,
                    "Repricing_Mechanism",
                    listing.translations
                  )
                )}
              />
            </div>
          </div>
        )}
      </div>
    </ListingDetailItem>
  )
}
