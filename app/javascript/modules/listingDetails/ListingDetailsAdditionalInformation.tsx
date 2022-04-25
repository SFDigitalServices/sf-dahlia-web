import React from "react"
import { ListingDetailItem, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { TextTruncate } from "../../components/TextTruncate"

export interface ListingDetailsAdditionalInformationProps {
  listing: RailsListing
  imageSrc: string
}

export const ListingDetailsAdditionalInformation = ({
  listing,
  imageSrc,
}: ListingDetailsAdditionalInformationProps) => {
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
            <h3 className="text-serif-lg">{t("listings.special_notes")}</h3>
            <TextTruncate text={listing.Listing_Other_Notes} />
          </div>
        )}
        <div className="info-card bg-gray-100 border-0">
          <h3 className="text-serif-lg">{t("listings.required_documents")}</h3>
          <div className="text-sm">
            <TextTruncate text={listing.Required_Documents} />
          </div>
        </div>
        <div className="info-card bg-gray-100 border-0">
          <h3 className="text-serif-lg">{t("listings.important_program_rules")}</h3>
          <TextTruncate text={listing.Legal_Disclaimers} />
        </div>
        {listing.CC_and_R_URL && (
          <div className="info-card bg-gray-100 border-0">
            <h3 className="text-serif-lg">{t("listings.cc&r")}</h3>
            <div className="text-sm">
              <TextTruncate text={listing.CC_and_R_URL} />
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
            <h3 className="text-serif-lg">{t("listings.re_pricing")}</h3>
            <div className="text-sm">
              <TextTruncate text={listing.Repricing_Mechanism} />
            </div>
          </div>
        )}
      </div>
    </ListingDetailItem>
  )
}
