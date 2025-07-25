import React, { ReactNode } from "react"
import { LinkButton, ListingDetailItem, Mobile, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { TextTruncate } from "../../components/TextTruncate"
import { isHabitatListing, isOpen, isSale, isLotterySalesListing } from "../../util/listingUtil"
import { stripMostTags } from "../../util/filterUtil"
import { getTranslatedString, localizedFormat } from "../../util/languageUtil"

export interface ListingDetailsAdditionalInformationProps {
  listing: RailsListing
  imageSrc: string
}

const RequiredDocuments = ({
  listing,
  children,
}: {
  listing: RailsListing
  children?: ReactNode
}) => {
  return (
    <div className="info-card bg-gray-100 border-0">
      <h3 className="text-serif-xl">{t("listings.requiredDocuments")}</h3>
      <div className="text-xs">
        <TextTruncate
          className="primary-lighter-markup-link translate"
          buttonClassName="text-blue-700"
          text={stripMostTags(
            getTranslatedString(
              listing.Required_Documents,
              "Required_Documents__c",
              listing.translations
            )
          )}
        />
      </div>
      {children}
    </div>
  )
}

export const ListingDetailsAdditionalInformation = ({
  listing,
  imageSrc,
}: ListingDetailsAdditionalInformationProps) => {
  // const getCommissionString = () => {
  //   return listing.Realtor_Commission_Unit === "percent"
  //     ? t("listings.realtorCommissionPercentage", {
  //         percentage: listing.Realtor_Commission_Amount,
  //       })
  //     : `$${listing.Realtor_Commission_Amount.toLocaleString()}`
  // }

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
                  "Listing_Other_Notes__c",
                  listing.translations
                )
              )}
            />
          </div>
        )}
        {
          // Show the component if there are required documents (there aren't always)
          // Always show the component for lottery sales listings
          (!!listing?.Required_Documents || isLotterySalesListing(listing)) && (
            <RequiredDocuments listing={listing}>
              {
                // Lottery sales listings (excluding habitat listings) have specific content
                // that should always show in the Required documents section
                isLotterySalesListing(listing) && !isHabitatListing(listing) && (
                  <div className="text-xs mt-4">
                    <TextTruncate
                      className="primary-lighter-markup-link translate"
                      buttonClassName="text-blue-700"
                      text={t("listings.requiredDocumentsAfterApplying", {
                        url: "https://www.sf.gov/after-bmr-homebuyer-lottery",
                      })}
                    />
                  </div>
                )
              }
            </RequiredDocuments>
          )
        }
        {listing.Legal_Disclaimers && (
          <div className="info-card bg-gray-100 border-0">
            <h3 className="text-serif-xl">{t("listings.importantProgramRules")}</h3>
            <div className="text-xs">
              <TextTruncate
                text={stripMostTags(
                  getTranslatedString(
                    listing.Legal_Disclaimers,
                    "Legal_Disclaimers__c",
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
        {/*  DAH-3242: Realtor section hidden until future configuration */}
        {/* {isSale(listing) && (
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
                          "Realtor_Commission_Info__c",
                          listing.translations
                        )
                      )}
                    />
                  </span>
                </div>
              )}
            </div>
          </div>
        )} */}
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
                    "Repricing_Mechanism__c",
                    listing.translations
                  )
                )}
              />
            </div>
          </div>
        )}
        <Mobile>
          {isSale(listing) && (
            <div className="info-card bg-gray-100 border-0">
              <h3 className="text-serif-xl">{t("listings.housingProgram")}</h3>
              {!isHabitatListing(listing) ? (
                <a
                  href={`https://www.sf.gov/resource--2022--apply-homebuyer-programs`}
                  target="_blank"
                  className="text-xs"
                >
                  {t("listings.belowMarketRate")}
                </a>
              ) : (
                <a
                  href={`https://www.sf.gov/reports--december-2024--city-second-program-current-listings`}
                  target="_blank"
                  className="text-xs"
                >
                  {t("saleDirectory.callout.citySecondLoan")}
                </a>
              )}
            </div>
          )}
          {isOpen(listing) && (
            <div className="info-card bg-gray-100 border-0">
              <p className="text-xs">{`${t("t.listingUpdated")}: ${localizedFormat(
                listing.LastModifiedDate,
                "LL"
              )}`}</p>
            </div>
          )}
        </Mobile>
      </div>
    </ListingDetailItem>
  )
}
