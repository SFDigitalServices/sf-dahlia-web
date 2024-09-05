import React from "react"
import { RailsListing } from "../../modules/listings/SharedHelpers"
import "./ListingDetailsSeeTheUnit.scss"
import { t, Heading, Icon, IconFillColors } from "@bloom-housing/ui-components"
import { Heading as HeadingSeeds, Link } from "@bloom-housing/ui-seeds"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { ListingDetailsOpenHouses } from "./ListingDetailsOpenHouses"
import { ListingOnlineDetails } from "../../api/types/rails/listings/BaseRailsListing"

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
      {(listing.Multiple_Listing_Service_URL || listing.Listing_Online_Details) && (
        <SeeTheUnitSubsection title={t("seeTheUnit.seeDetailsOnline")}>
          <div className="flex-row gap-x-8 gap-y-4 grid-cols-3 space-y-2">
            <div>
              <Link
                className="no-underline"
                href={listing.Multiple_Listing_Service_URL}
                hideExternalLinkIcon={true}
              >
                {t("listings.process.seeTheUnitOnMls")}
              </Link>
            </div>
            {listing.Listing_Online_Details.map((record: ListingOnlineDetails) => {
              return (
                <div key={record.Id}>
                  <Link className="no-underline" href={record.URL} hideExternalLinkIcon={true}>
                    {record.Name}
                  </Link>
                </div>
              )
            })}
          </div>
        </SeeTheUnitSubsection>
      )}
      <SeeTheUnitSubsection title={t("seeTheUnit.makeAnAppointment")}>
        <p className="text-sm pb-3">{t("seeTheUnit.requestATour")}</p>
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
        <HeadingSeeds size="sm" className="pb-1">
          {t("contactAgent.officeHours.seeTheUnit")}
        </HeadingSeeds>
        <p className="text-sm">{listing.Office_Hours}</p>
      </SeeTheUnitSubsection>
    </section>
  )
}
