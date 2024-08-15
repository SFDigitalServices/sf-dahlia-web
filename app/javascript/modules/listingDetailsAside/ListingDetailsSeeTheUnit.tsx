import React from "react"
import { RailsListing } from "../../modules/listings/SharedHelpers"
import "./ListingDetailsSeeTheUnit.scss"
import { t, Heading, Icon, IconFillColors } from "@bloom-housing/ui-components"

import { Heading as HeadingSeeds } from "@bloom-housing/ui-seeds"
import { ListingEvent } from "../../api/types/rails/listings/BaseRailsListing"
import { localizedFormat } from "../../util/languageUtil"
import { getEventDateTime, getEventTimeString, sortByDateTimeString } from "../../util/listingUtil"

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
      {title && <HeadingSeeds size="md">{title}</HeadingSeeds>}
      <div>{children}</div>
    </div>
  )
}

const OpenHouses = ({ openHouses }: { openHouses: ListingEvent[] }) => {
  return openHouses
    .sort((a, b) =>
      sortByDateTimeString(
        getEventDateTime(a.Date, a.Start_Time),
        getEventDateTime(b.Date, b.Start_Time)
      )
    )
    .map((openHouse: ListingEvent) => {
      return (
        openHouse.Date && (
          <p className="flex justify-between open-house">
            <span>{openHouse.Date && localizedFormat(openHouse.Date, "LL")}</span>
            <span className="font-semibold">{getEventTimeString(openHouse)}</span>
          </p>
        )
      )
    })
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
        <div className="see-the-unit__subsection-content">
          {listing.Open_Houses?.length ? <OpenHouses openHouses={listing.Open_Houses} /> : null}
        </div>
      </SeeTheUnitSubsection>
      {listing.Multiple_Listing_Service_URL && (
        <SeeTheUnitSubsection title={t("seeTheUnit.seeDetailsOnline")}>
          <p className="mt-1">
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
        <p className="text-xl">{listing.Leasing_Agent_Name}</p>
        <p className="text-gray-700">{listing.Leasing_Agent_Title}</p>
        <div className="py-4">
          <p className="pb-2">
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
          <p>
            <a href={`mailto:${listing.Leasing_Agent_Email}`}>
              <Icon symbol="mail" size="medium" fill={IconFillColors.primary} className={"pr-2"} />
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
