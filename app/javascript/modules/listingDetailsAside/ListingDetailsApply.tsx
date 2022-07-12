import React, { useState } from "react"
import {
  AppearanceStyleType,
  Button,
  LinkButton,
  OrDivider,
  PaperApplication,
  QuantityRowSection,
  SidebarBlock,
  Heading,
  t,
  MultiLineAddress,
} from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import {
  acceptingPaperApplications,
  isOpen,
  isRental,
  isSale,
  mohcdRentalPaperAppURLTemplate,
  mohcdSalePaperAppURLTemplate,
  paperAppLanguages,
} from "../../util/listingUtil"
import { localizedFormat } from "../../util/languageUtil"

export interface ListingDetailsApplyProps {
  listing: RailsListing
}

export const ListingDetailsApply = ({ listing }: ListingDetailsApplyProps) => {
  if (!isOpen(listing)) return null

  const [paperApplicationsOpen, setPaperApplicationsOpen] = useState(false)
  const isListingRental = isRental(listing)

  const acceptingPaperApps = acceptingPaperApplications(listing)

  const urlBase = isListingRental ? mohcdRentalPaperAppURLTemplate : mohcdSalePaperAppURLTemplate
  const paperApplications = acceptingPaperApps
    ? paperAppLanguages.map(
        (lang): PaperApplication => {
          return {
            languageString: lang.label,
            fileURL: urlBase.replace("{lang}", lang.slug || lang.language),
          }
        }
      )
    : []

  const waitlistUnavailableDescription = (
    <>
      <p className={"mb-2"}>{t("listings.noAvailableUnits")}</p>
      <p>{t("listings.enterLotteryForWaitlist")}</p>
    </>
  )

  const waitlistAvailableDescription = <p>{t("listings.availableUnitsAndWaitlistDescription")}</p>

  const waitlistUnavailableRows = [
    {
      amount: listing.Number_of_people_currently_on_waitlist,
      text: t("listings.currentWaitlistSize"),
      emphasized: false,
    },
    {
      amount: listing.Total_waitlist_openings,
      text: t("listings.openWaitlistSlots"),
      emphasized: true,
    },
    {
      amount: listing.Maximum_waitlist_size,
      text: t("listings.finalWaitlistSize"),
      emphasized: false,
    },
  ]

  const waitlistAvailableRows = [
    {
      amount: listing.Units_Available,
      text: t("listings.availableUnits"),
      emphasized: true,
    },
    {
      amount: listing.Total_waitlist_openings,
      text: t("listings.openWaitlistSlots"),
      emphasized: true,
    },
  ]

  const ordinalHeader = (ordinal: number, title: string) => {
    return (
      <Heading priority={4} className={"text-gray-900 text-lg -mt-2 mb-3"}>
        <span className={"text-blue-600 mr-2"}>{ordinal}</span>
        {title}
      </Heading>
    )
  }

  return (
    <>
      {listing.hasWaitlist && (
        <>
          {listing.Units_Available === 0 && (
            <QuantityRowSection
              quantityRows={waitlistUnavailableRows}
              strings={{
                sectionTitle: t("listings.waitlistIsOpen"),
                description: waitlistUnavailableDescription,
              }}
            />
          )}
          {listing.Units_Available > 0 && (
            <QuantityRowSection
              quantityRows={waitlistAvailableRows}
              strings={{
                sectionTitle: t("listings.availableUnitsAndWaitlist"),
                description: waitlistAvailableDescription,
              }}
            />
          )}
        </>
      )}
      <SidebarBlock title={"How to Apply"}>
        {!isListingRental && (
          <>
            <p className={"mb-4"}>
              Make sure you fulfill the{" "}
              <a href={"https://sfmohcd.org/homebuyer-program-eligibility"} target={"_blank"}>
                eligibility requirements
              </a>{" "}
              for this listing before you begin.
            </p>
            <p className={"mb-4"}>
              Your loan pre-approval letter must be dated within the past 120 days, and your
              Homebuyer Education verification must be dated within the past year.
            </p>
          </>
        )}
        <Button styleType={AppearanceStyleType.primary} className={"w-full"} transition={true}>
          Apply Online
        </Button>
        {acceptingPaperApps && (
          <>
            <OrDivider bgColor={"white"} />
            {ordinalHeader(1, "Get a Paper Application")}
            Paper applications must be sent by US Mail and cannot be submitted in person.
            <Button
              className={"w-full mt-4"}
              transition={true}
              icon={"arrowDown"}
              iconPlacement={"right"}
              onClick={() => setPaperApplicationsOpen(!paperApplicationsOpen)}
            >
              Download Application
            </Button>
            {paperApplicationsOpen && (
              <div className={"flex w-full items-center justify-center flex-col"}>
                {paperApplications.map((app) => {
                  return (
                    <LinkButton href={app.fileURL} unstyled className={"m-0 pt-4 no-underline"}>
                      {app.languageString}
                    </LinkButton>
                  )
                })}
              </div>
            )}
          </>
        )}
      </SidebarBlock>

      {acceptingPaperApps && (
        <>
          <SidebarBlock className={"bg-blue-200"}>
            {ordinalHeader(2, "Submit a Paper Application")}
            In order to receive your lottery number, include a self addressed stamped envelope,
            otherwise one will not be mailed to you.
          </SidebarBlock>
          <SidebarBlock
            className={"bg-blue-200"}
            style={"sidebarSubHeader"}
            title={"Send application by US mail"}
          >
            <div className={"mb-2 text-gray-900 text-base"}>
              <MultiLineAddress
                address={{
                  placeName: listing.Application_Organization,
                  street: listing.Application_Street_Address,
                  city: listing.Application_City,
                  zipCode: listing.Application_Postal_Code,
                  state: listing.Application_State,
                }}
              />
            </div>
            Applications must be received by the deadline and postmarks will not be considered.
          </SidebarBlock>
          <SidebarBlock className={"bg-blue-200"}>
            Do not apply online and also send in a paper application. All applications containing
            any person who appears on more than one application will be removed from the lottery.
          </SidebarBlock>
        </>
      )}

      <section className="aside-block">
        <h4 className="text-caps-underline">{t("listings.apply.needHelp")}</h4>
        <div className="text-tiny text-gray-750 flex flex-col justify-center">
          {isListingRental && (
            <div className={"mb-4"}>{t("listings.apply.visitAHousingCounselor")}</div>
          )}
          <LinkButton
            transition={true}
            newTab={true}
            href={"https://www.homeownershipsf.org/application-assistance-for-homebuyers/"}
          >
            {t("housingCounselor.findAHousingCounselor")}
          </LinkButton>
        </div>
      </section>
      {isSale(listing) && listing.Expected_Move_in_Date && (
        <section className="aside-block">
          <h4 className="text-caps-underline">{t("listings.expectedMoveinDate")}</h4>
          <div className="text-tiny text-gray-750 flex flex-col justify-center">
            {localizedFormat(listing.Expected_Move_in_Date, "MMMM YYYY")}
          </div>
        </section>
      )}
    </>
  )
}
