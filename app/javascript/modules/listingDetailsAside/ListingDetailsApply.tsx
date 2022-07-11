import React, { useState } from "react"
import dayjs from "dayjs"
import {
  AppearanceStyleType,
  Button,
  ExpandableSection,
  LinkButton,
  OrDivider,
  PaperApplication,
  QuantityRowSection,
  SidebarBlock,
  Heading,
  t,
} from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import {
  acceptingPaperApplications,
  isLotteryComplete,
  isOpen,
  isRental,
  isSale,
} from "../../util/listingUtil"
import { localizedFormat } from "../../util/languageUtil"

export interface ListingDetailsApplyProps {
  listing: RailsListing
}

export const ListingDetailsApply = ({ listing }: ListingDetailsApplyProps) => {
  const [paperApplicationsOpen, setPaperApplicationsOpen] = useState(false)
  const isListingRental = isRental(listing)

  const availableDescription = <p>{t("listings.availableUnitsAndWaitlistDescription")}</p>

  const mohcdPaperAppURLBase = "https://sfmohcd.org/sites/default/files/Documents/MOH/"
  const mohcdRentalPaperAppURLTemplate =
    mohcdPaperAppURLBase +
    "BMR%20Rental%20Paper%20Applications/" +
    "{lang}%20BMR%20Rent%20Short%20Form%20Paper%20App.pdf"
  const mohcdSalePaperAppURLTemplate =
    mohcdPaperAppURLBase +
    "BMR%20Ownership%20Paper%20Applications/" +
    "{lang}%20BMR%20Own%20Short%20Form%20Paper%20App.pdf"

  const paperAppLanguages = [
    { language: "English", label: "English" },
    { language: "Spanish", label: "Español" },
    { language: "Traditional Chinese", label: "中文", slug: "Chinese" },
    { language: "Tagalog", label: "Filipino" },
  ]

  const urlBase = isListingRental ? mohcdRentalPaperAppURLTemplate : mohcdSalePaperAppURLTemplate
  const paperApplications = acceptingPaperApplications
    ? paperAppLanguages.map(
        (lang): PaperApplication => {
          return {
            languageString: lang.label,
            fileURL: urlBase.replace("{lang}", lang.slug || lang.language),
          }
        }
      )
    : []

  const availableRows = [
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

  const unavailableDescription = (
    <>
      <p className={"mb-2"}>{t("listings.noAvailableUnits")}</p>
      <p>{t("listings.enterLotteryForWaitlist")}</p>
    </>
  )

  const unavailableRows = [
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

  const listingsOpen = dayjs(listing.Application_Due_Date) > dayjs()

  return (
    <>
      {listing.hasWaitlist && (listingsOpen || isLotteryComplete(listing)) && (
        <>
          {listing.Units_Available === 0 && (
            <QuantityRowSection
              quantityRows={unavailableRows}
              strings={{
                sectionTitle: t("listings.waitlistIsOpen"),
                description: unavailableDescription,
              }}
            />
          )}
          {listing.Units_Available > 0 && (
            <QuantityRowSection
              quantityRows={availableRows}
              strings={{
                sectionTitle: t("listings.availableUnitsAndWaitlist"),
                description: availableDescription,
              }}
            />
          )}
        </>
      )}
      <SidebarBlock title={"How to Apply"}>
        <Button styleType={AppearanceStyleType.primary} className={"w-full"} transition={true}>
          Apply Online
        </Button>
        <OrDivider bgColor={"white"} />
        <Heading priority={4} className={"text-gray-900 text-lg -mt-2 mb-3"}>
          <span className={"text-blue-600 mr-1"}>1</span>Get a Paper Application
        </Heading>
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
      </SidebarBlock>

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
      <ExpandableSection
        content={t("emailer.submissionConfirmation.applicantsWillBeContacted")}
        expandableContent={t("f2ReviewTerms.p3")}
        strings={{
          title: t("label.whatToExpect"),
          readMore: t("label.readMore"),
          readLess: t("label.readLess"),
        }}
      />
    </>
  )
}
