import { Icon, IconFillColors, t } from "@bloom-housing/ui-components"
import { Heading } from "@bloom-housing/ui-seeds"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import RailsSaleListing from "../../../api/types/rails/listings/RailsSaleListing"
import { getTranslatedString } from "../../../util/languageUtil"

export const LeasingAgent = ({ listing }: { listing: RailsSaleListing }) => {
  return (
    <div className="leasing-agent">
      <p className="m-0">{listing.Leasing_Agent_Name}</p>
      <p className="text-gray-750 text-sm">
        {getTranslatedString(
          listing.Leasing_Agent_Title,
          "Leasing_Agent_Title__c",
          listing.translations
        )}
      </p>
      <a
        href={
          listing.Leasing_Agent_Phone
            ? `tel:${listing.Leasing_Agent_Phone.replace(/[-()]/g, "")}`
            : undefined
        }
      >
        <Icon symbol="phone" size="medium" fill={IconFillColors.primary} className={"pr-2"} />
        {listing.Leasing_Agent_Phone
          ? t("listings.call", { phoneNumber: listing.Leasing_Agent_Phone })
          : undefined}
      </a>
      <div className="pb-3 pt-1">
        <a href={`mailto:${listing.Leasing_Agent_Email}`}>
          <span className="pr-2">
            <FontAwesomeIcon icon={faEnvelope} />
          </span>
          {t("label.emailAddress")}
        </a>
      </div>
      <Heading size="sm" priority={3}>
        {t("contactAgent.officeHours.seeTheUnit")}
      </Heading>
      <p className="text-sm">
        {getTranslatedString(listing.Office_Hours, "Office_Hours__c", listing.translations)}
      </p>
    </div>
  )
}

export default LeasingAgent
