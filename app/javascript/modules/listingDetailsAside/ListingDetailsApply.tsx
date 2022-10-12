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
  isHabitatListing,
  isOpen,
  isRental,
  isSale,
  paperApplicationURLs,
} from "../../util/listingUtil"
import { localizedFormat, renderInlineMarkup } from "../../util/languageUtil"

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
            {renderInlineMarkup(
              t("listings.apply.fulfillEligibilityRequirements", {
                url: isHabitatListing(listing)
                  ? "https://habitatgsf.org/amber-drive-info/"
                  : "https://sfmohcd.org/homebuyer-program-eligibility",
              })
            )}
          </p>
          <p className={"mb-4"}>{t("listings.apply.eligibilityRequirementDescription")}</p>
        </>
      )}
      <LinkButton
        styleType={AppearanceStyleType.primary}
        className={"w-full"}
        transition={true}
        href={`listings/${listing.listingID}/apply-welcome/intro`}
      >
        {t("label.applyOnline")}
      </LinkButton>
      {process.env.COVID_UPDATE && (
        <div className={"mt-4"}>
          <Heading priority={4} className={"text-base text-gray-800 font-sans"}>
            {t("listings.apply.covidUpdate")}
          </Heading>
          <div className={"text-gray-700 text-base mt-2"}>
            {t("listings.apply.covidUpdateInfo")}
          </div>
        </div>
      )}
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
            {t("label.downloadApplication")}
          </Button>
          {paperApplicationsOpen && acceptingPaperApplications && (
            <div className={"flex w-full items-center justify-center flex-col"}>
              {paperApplicationURLs(isListingRental).map((app) => {
                return (
                  <span className={"pt-4"}>
                    <LinkButton
                      href={app.fileURL}
                      unstyled
                      className={"m-0 no-underline"}
                      newTab={true}
                    >
                      {app.languageString}
                    </LinkButton>
                  </span>
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
        styleType={"capsWeighted"}
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
        {t("listings.doNotApplyOneAndPaperOrMultiple")}
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
        href={
          !isListingRental
            ? "https://www.homeownershipsf.org/application-assistance-for-homebuyers/"
            : "/housing-counselors"
        }
        className={"w-full"}
      >
        {isListingRental
          ? t("housingCounselor.findAHousingCounselor")
          : t("listings.apply.visitHomeownershipSf")}
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
