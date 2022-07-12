import React, { useState } from "react"
import {
  AppearanceStyleType,
  Button,
  Heading,
  LinkButton,
  MultiLineAddress,
  OrDivider,
  SidebarBlock,
  t,
} from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import {
  acceptingPaperApplications,
  isOpen,
  isRental,
  isSale,
  paperApplicationURLs,
} from "../../util/listingUtil"
import { localizedFormat, renderInlineWithInnerHTML } from "../../util/languageUtil"

export interface ListingDetailsApplyProps {
  listing: RailsListing
}

export const ListingDetailsApply = ({ listing }: ListingDetailsApplyProps) => {
  const [paperApplicationsOpen, setPaperApplicationsOpen] = useState(false)

  if (!isOpen(listing)) return null

  const isListingRental = isRental(listing)

  const acceptingPaperApps = acceptingPaperApplications(listing)

  const ordinalHeader = (ordinal: number, title: string) => {
    return (
      <Heading priority={4} className={"text-gray-900 text-lg -mt-2 mb-3"}>
        <span className={"text-blue-600 mr-2"}>{ordinal}</span>
        {title}
      </Heading>
    )
  }

  const howToApplyBlock = (
    <SidebarBlock title={t("listings.apply.howToApply")}>
      {!isListingRental && (
        <>
          <p className={"mb-4"}>
            {renderInlineWithInnerHTML(
              t("listings.apply.fulfillEligibilityRequirements", {
                url: "https://sfmohcd.org/homebuyer-program-eligibility",
              })
            )}
          </p>
          <p className={"mb-4"}>{t("listings.apply.eligibilityRequirementDescription")}</p>
        </>
      )}
      <Button styleType={AppearanceStyleType.primary} className={"w-full"} transition={true}>
        {t("label.applyOnline")}
      </Button>
      {acceptingPaperApps && (
        <>
          <OrDivider bgColor={"white"} />
          {ordinalHeader(1, t("listings.apply.getAPaperApplication"))}
          {t("listings.apply.paperApplicationsMustBeMailed")}
          <Button
            className={"w-full mt-4"}
            transition={true}
            icon={"arrowDown"}
            iconPlacement={"right"}
            onClick={() => setPaperApplicationsOpen(!paperApplicationsOpen)}
          >
            {t("label.downloadApplication", {
              lang: "",
            })}
          </Button>
          {paperApplicationsOpen && acceptingPaperApplications && (
            <div className={"flex w-full items-center justify-center flex-col"}>
              {paperApplicationURLs(isListingRental).map((app) => {
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
  )

  const submitPaperApplicationBlocks = (
    <>
      <SidebarBlock className={"bg-blue-200"}>
        {ordinalHeader(2, t("listings.apply.submitAPaperApplication"))}
        {t("listings.apply.includeAnEnvelope")}
      </SidebarBlock>
      <SidebarBlock
        className={"bg-blue-200"}
        style={"sidebarSubHeader"}
        title={t("listings.apply.sendByUsMail")}
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
        {t("listings.apply.applicationsMustBeReceivedByDeadline")}
      </SidebarBlock>
      <SidebarBlock className={"bg-blue-200"}>
        {`${t("listings.apply.doNotApplyOnlineAndPaper")} ${t(
          "listings.apply.doNotDoMultipleApplications"
        )}`}
      </SidebarBlock>
    </>
  )

  const needHelpBlock = (
    <SidebarBlock title={t("listings.apply.needHelp")}>
      {isListingRental && (
        <div className={"mb-4"}>{t("listings.apply.visitAHousingCounselor")}</div>
      )}
      <LinkButton
        transition={true}
        newTab={true}
        href={"https://www.homeownershipsf.org/application-assistance-for-homebuyers/"}
        className={"w-full"}
      >
        {t("housingCounselor.findAHousingCounselor")}
      </LinkButton>
    </SidebarBlock>
  )

  const expectedMoveInDateBlock = (
    <SidebarBlock title={t("listings.expectedMoveinDate")}>
      {localizedFormat(listing.Expected_Move_in_Date, "MMMM YYYY")}
    </SidebarBlock>
  )

  return (
    <>
      {howToApplyBlock}
      {acceptingPaperApps && submitPaperApplicationBlocks}
      {needHelpBlock}
      {isSale(listing) && listing.Expected_Move_in_Date && expectedMoveInDateBlock}
    </>
  )
}
