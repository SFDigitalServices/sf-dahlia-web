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
  getFcfsSalesListingState,
  isFcfsSalesListing,
  isHabitatListing,
  isOpen,
  isRental,
  paperApplicationURLs,
} from "../../util/listingUtil"
import { getSfGovUrl, renderInlineMarkup } from "../../util/languageUtil"
import "./ListingDetailsApply.scss"
import { getAddProfilePath, getSignInPath, localizedPath } from "../../util/routeUtil"
import { ListingState } from "../listings/ListingState"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../constants"
import {
  SessionProviderKind,
  SessionStatus,
  useSession,
} from "../../authentication/session"

export interface ListingDetailsApplyProps {
  listing: RailsListing
}

const FcfsBmrSalesHowToApply = ({ listingId }: { listingId: string }) => (
  <SidebarBlock
    className="fcfs-bmr-how-to-apply"
    title={t("listings.apply.howToApply")}
    priority={2}
  >
    <div className="fcfs-bmr-how-to-apply__list">
      <ol className="numbered-list text-black text-base">
        <li>{t("listings.fcfs.bmrSales.howToApply.step1")}</li>
        <li>{t("listings.fcfs.bmrSales.howToApply.step2")}</li>
        <li>{t("listings.fcfs.bmrSales.howToApply.step3")}</li>
      </ol>
    </div>
    <Button
      styleType={AppearanceStyleType.primary}
      className={"w-full"}
      transition={true}
      onClick={() => (window.location.href = localizedPath(`listings/${listingId}/how-to-apply`))}
      ariaLabel={t("listings.fcfs.bmrSales.howToApply.aria")}
    >
      {t("t.getStarted")}
    </Button>
  </SidebarBlock>
)

const ordinalHeader = (ordinal: number, title: string) => {
  return (
    <Heading priority={2} className={"text-gray-950 text-xl -mt-2 mb-3"}>
      <span className={"text-blue-500 mr-2"}>{ordinal}</span>
      {title}
    </Heading>
  )
}

const ApplyButton = ({ href }: { href: string }) => (
  <LinkButton
    styleType={AppearanceStyleType.primary}
    className={"w-full"}
    transition={true}
    href={href}
  >
    {t("label.applyOnline")}
  </LinkButton>
)

/**
 * Where the apply button should send someone, given who they are.
 *
 * Every state of the session union is handled, so there is no path that leaves
 * the button with an empty href. While we are still resolving the session the
 * button is disabled rather than pointing at nothing.
 */
const GatedApplyOnlineButton = ({ applyLink }: { applyLink: string }) => {
  const { session } = useSession()

  switch (session.status) {
    case SessionStatus.Loading:
      return (
        <Button styleType={AppearanceStyleType.primary} className={"w-full"} disabled={true}>
          {t("label.applyOnline")}
        </Button>
      )
    case SessionStatus.SignedOut:
      return <ApplyButton href={getSignInPath()} />
    case SessionStatus.SignedInWithoutProfile:
      return <ApplyButton href={getAddProfilePath()} />
    case SessionStatus.SignedIn:
      return <ApplyButton href={applyLink} />
  }
}

/**
 * If the React form engine is enabled, link to the React application.
 * Otherwise, link to the Angular application.
 *
 * Under Clerk, applying requires an account with a profile, so the button
 * routes signed-out and profile-less users to finish that first. Under Devise
 * the Angular flow still accepts anonymous applications, so the button links
 * straight to the form regardless of session. That difference is product
 * behaviour, not plumbing, which is why this is one of the few places that
 * legitimately asks which provider is active.
 */
const ApplyOnlineButton = ({ listingId }: { listingId: string }) => {
  const { provider } = useSession()
  const { unleashFlag: formEngine } = useFeatureFlag(UNLEASH_FLAG.FORM_ENGINE, false)
  let applyLink = localizedPath(`listings/${listingId}/apply-welcome/intro`)
  if (formEngine) {
    applyLink = localizedPath(`listings/${listingId}/apply/intro`)
  }

  if (provider === SessionProviderKind.Clerk) {
    return <GatedApplyOnlineButton applyLink={applyLink} />
  }

  return <ApplyButton href={applyLink} />
}

const StandardHowToApply = ({
  listingId,
  isListingRental,
  isHabitatListing,
  acceptingPaperApps,
}: {
  listingId: string
  isListingRental: boolean
  isHabitatListing: boolean
  acceptingPaperApps: boolean
}) => {
  const [paperApplicationsOpen, setPaperApplicationsOpen] = useState(false)

  return (
    <SidebarBlock title={t("listings.apply.howToApply")} priority={2}>
      {!isListingRental && (
        <>
          <p className={"mb-4"}>
            {renderInlineMarkup(
              t("listings.apply.fulfillEligibilityRequirements", {
                url: isHabitatListing
                  ? "https://habitatgsf.org/amber-drive-sf/"
                  : getSfGovUrl(
                      "https://sf.gov/determine-if-you-can-buy-affordable-housing-program"
                    ),
              })
            )}
          </p>
          {!isHabitatListing && (
            <p className={"mb-4"}>{t("listings.apply.eligibilityRequirementDescription")}</p>
          )}
        </>
      )}
      <ApplyOnlineButton listingId={listingId} />
      {process.env.COVID_UPDATE && (
        <div className={"mt-4"}>
          <Heading priority={2} className={"text-base text-gray-800 font-sans"}>
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
                  <span className={"pt-4"} key={app.languageString}>
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
}

export const ListingDetailsApply = ({ listing }: ListingDetailsApplyProps) => {
  const isFcfsBmrSales = isFcfsSalesListing(listing)
  const listingState = getFcfsSalesListingState(listing)

  // FCFS BMR Sales rely on listing states
  // Other listings use the isOpen function
  if (isFcfsBmrSales ? listingState === ListingState.Closed : !isOpen(listing)) return null

  const isListingRental = isRental(listing)

  const acceptingPaperApps = acceptingPaperApplications(listing)

  const howToApplyBlock = isFcfsBmrSales ? (
    <FcfsBmrSalesHowToApply listingId={listing.listingID} />
  ) : (
    <StandardHowToApply
      listingId={listing.listingID}
      isListingRental={isListingRental}
      isHabitatListing={isHabitatListing(listing)}
      acceptingPaperApps={acceptingPaperApps}
    />
  )

  const submitPaperApplicationBlocks = (
    <>
      <SidebarBlock className={"bg-blue-100"} priority={2}>
        {ordinalHeader(2, t("listings.apply.submitAPaperApplication"))}
        {t("listings.apply.includeAnEnvelope")}
      </SidebarBlock>
      <SidebarBlock
        className={"bg-blue-100"}
        styleType={"capsWeighted"}
        title={t("listings.apply.sendByUsMail")}
        priority={2}
      >
        <div className={"mb-2 text-gray-950 text-base"}>
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
      <SidebarBlock className={"bg-blue-100"} priority={2}>
        {t("listings.doNotApplyOneAndPaperOrMultiple")}
      </SidebarBlock>
    </>
  )

  return (
    <div className="md:px-0 px-2">
      {howToApplyBlock}
      {!isFcfsBmrSales && acceptingPaperApps && submitPaperApplicationBlocks}
    </div>
  )
}
