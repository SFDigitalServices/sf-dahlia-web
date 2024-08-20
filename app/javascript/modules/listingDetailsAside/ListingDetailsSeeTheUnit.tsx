import React from "react"
import { RailsListing } from "../../modules/listings/SharedHelpers"
import "./ListingDetailsSeeTheUnit.scss"
import { t, Heading, Icon, IconFillColors } from "@bloom-housing/ui-components"
import { Heading as HeadingSeeds } from "@bloom-housing/ui-seeds"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { ListingDetailsOpenHouses } from "./ListingDetailsOpenHouses"

export interface SeeTheUnitProps {
  listing: RailsListing
}

export interface SubsectionProps {
  title?: string
  children: React.ReactNode
}

const SeeTheUnitSubsection = ({ title, children }: SubsectionProps) => {
  return (
    <div className="see-the-unit__subsection">
      {title && (
        <HeadingSeeds size="md" className="pb-3">
          {title}
        </HeadingSeeds>
      )}
      <div>{children}</div>
    </div>
  )
}

export const ListingDetailsSeeTheUnit = ({ listing }: SeeTheUnitProps) => {
  return (
    <section className="aside-block see-the-unit">
      <div className="see-the-unit__heading">
        <Heading priority={4} styleType="underlineWeighted">
          {t("label.seeTheUnit")}
        </Heading>
      </div>
      <SeeTheUnitSubsection title={t("label.openHouses.seeTheUnit")}>
        {listing.Open_Houses?.length ? (
          <ListingDetailsOpenHouses listing={listing} sectionHeader={false} />
        ) : null}
      </SeeTheUnitSubsection>
      {listing.Multiple_Listing_Service_URL && (
        <SeeTheUnitSubsection title={t("seeTheUnit.seeDetailsOnline")}>
          <p>
            <a href={listing.Multiple_Listing_Service_URL} target="_blank">
              {t("listings.process.seeTheUnitOnMls")}
            </a>
          </p>
        </SeeTheUnitSubsection>
      )}
      <SeeTheUnitSubsection title={t("seeTheUnit.makeAnAppointment")}>
        <div className="see-the-unit__subsection-content">
          <p>{t("seeTheUnit.requestATour")}</p>
        </div>
      </SeeTheUnitSubsection>
      <SeeTheUnitSubsection>
        <p>{listing.Leasing_Agent_Name}</p>
        <p className="text-gray-700 text-sm">{listing.Leasing_Agent_Title}</p>
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
        <HeadingSeeds size="md">{t("contactAgent.officeHours.seeTheUnit")}</HeadingSeeds>
        <div className="see-the-unit__subsection-content">
          <p>{listing.Office_Hours}</p>
        </div>
      </SeeTheUnitSubsection>
    </section>
  )
}
