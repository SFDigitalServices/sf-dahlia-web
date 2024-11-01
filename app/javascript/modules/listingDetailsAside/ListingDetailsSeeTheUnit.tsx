import React from "react"
import { RailsListing } from "../../modules/listings/SharedHelpers"
import "./ListingDetailsSeeTheUnit.scss"
import { t, Heading, Icon, IconFillColors } from "@bloom-housing/ui-components"
import { Heading as HeadingSeeds, Link } from "@bloom-housing/ui-seeds"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { ListingDetailsOpenHouses } from "./ListingDetailsOpenHouses"
import { ListingOnlineDetail } from "../../api/types/rails/listings/BaseRailsListing"
import { getTranslatedString, renderInlineMarkup } from "../../util/languageUtil"

export interface SeeTheUnitProps {
  listing: RailsListing
}

export interface SubsectionProps {
  title: string
  children: React.ReactNode
  headingClass?: string
}

const SeeTheUnitSubsection = ({ title, children, headingClass }: SubsectionProps) => {
  return (
    <div className="see-the-unit__subsection">
      <HeadingSeeds size="md" className={headingClass ?? "pb-3"}>
        {title}
      </HeadingSeeds>
      <div>{children}</div>
    </div>
  )
}

const SeeDetailsOnline = (listing: RailsListing) => (
  <SeeTheUnitSubsection title={t("seeTheUnit.seeDetailsOnline")}>
    <div className="flex-row space-y-1">
      {listing.Multiple_Listing_Service_URL && (
        <div>
          <Link
            className="no-underline"
            href={listing.Multiple_Listing_Service_URL}
            hideExternalLinkIcon={true}
          >
            {t("listings.process.seeTheUnitOnMls")}
          </Link>
        </div>
      )}
      {listing.Listing_Online_Details?.map((detail: ListingOnlineDetail) => {
        // if the link provided from salesforce doesn't include http|https it gets treated as an internal link
        // prepending // forces it to be treated as an internal link
        const link = detail.URL.includes("http") ? detail.URL : `//${detail.URL}`
        return (
          <div key={detail.Id}>
            <a href={link} target="_blank">
              {getTranslatedString(
                detail.Listing_Online_Detail_Name,
                `${detail.Id}.Listing_Online_Details.Listing_Online_Detail_Name__c`,
                listing.translations
              )}
            </a>
          </div>
        )
      })}
    </div>
  </SeeTheUnitSubsection>
)

export const ListingDetailsSeeTheUnit = ({ listing }: SeeTheUnitProps) => {
  return (
    <section className="aside-block see-the-unit translate">
      <div className="see-the-unit__heading">
        <Heading priority={4} styleType="underlineWeighted">
          {t("label.seeTheUnit")}
        </Heading>
      </div>
      {listing.Open_Houses?.length && (
        <SeeTheUnitSubsection title={t("label.openHouses.seeTheUnit")}>
          <ListingDetailsOpenHouses listing={listing} sectionHeader={false} />
        </SeeTheUnitSubsection>
      )}
      {(listing.Multiple_Listing_Service_URL || listing.Listing_Online_Details) &&
        SeeDetailsOnline(listing)}
      <SeeTheUnitSubsection title={t("seeTheUnit.makeAnAppointment")}>
        <p className="text-sm pb-3">{t("seeTheUnit.requestATour")}</p>
        <p>{listing.Leasing_Agent_Name}</p>
        <p className="text-gray-700 text-sm">
          {getTranslatedString(
            listing.Leasing_Agent_Title,
            "Leasing_Agent_Title__c",
            listing.translations
          )}
        </p>
        <div className="pt-2">
          <p className="pb-1">
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
          </p>
          <p className="pb-3">
            <a href={`mailto:${listing.Leasing_Agent_Email}`}>
              <span className="pr-2">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              {t("label.emailAddress")}
            </a>
          </p>
        </div>
        <HeadingSeeds size="sm" className="pb-1">
          {t("contactAgent.officeHours.seeTheUnit")}
        </HeadingSeeds>
        <p className="text-sm">
          {renderInlineMarkup(
            getTranslatedString(listing.Office_Hours, "Office_Hours__c", listing.translations)
          )}
        </p>
      </SeeTheUnitSubsection>
    </section>
  )
}
