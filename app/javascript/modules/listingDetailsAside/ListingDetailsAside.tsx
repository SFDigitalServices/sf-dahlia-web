import React from "react"
import { LinkButton, ListingDetailItem, SidebarBlock, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailsInfoSession } from "./ListingDetailsInfoSession"
import { ListingDetailsProcess } from "./ListingDetailsProcess"
import { isFcfsListing, isOpen, isRental, isSale } from "../../util/listingUtil"
import { ListingDetailsApply } from "./ListingDetailsApply"
import { ListingDetailsApplicationDate } from "./ListingDetailsApplicationDate"
import { ListingDetailsLotteryResults } from "../listingDetailsLottery/ListingDetailsLotteryResults"
import { ListingDetailsLotteryInfo } from "../listingDetailsLottery/LotteryDetailsLotteryInfo"
import { ListingDetailsWaitlist } from "./ListingDetailsWaitlist"
import { ListingDetailsOpenHouses } from "./ListingDetailsOpenHouses"
import { ListingDetailsSeeTheUnit } from "./ListingDetailsSeeTheUnit"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { localizedFormat } from "../../util/languageUtil"
import { getHousingCounselorsPath } from "../../util/routeUtil"
import { Card, Link } from "@bloom-housing/ui-seeds"
import { CardFooter, CardHeader, CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import "./ListingDetailsAside.scss"

export interface ListingDetailsSidebarProps {
  listing: RailsListing
  imageSrc: string
}

export const ListingDetailsAside = ({ listing, imageSrc }: ListingDetailsSidebarProps) => {
  const isApplicationOpen = isOpen(listing)
  const isSaleListing = isSale(listing)
  const isListingRental = isRental(listing)

  const seeTheUnitEnabled = useFeatureFlag("see_the_unit", false)

  const expectedMoveInDateBlock = (
    <SidebarBlock title={t("listings.expectedMoveinDate")}>
      {localizedFormat(listing.Expected_Move_in_Date, "MMMM YYYY")}
    </SidebarBlock>
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
            ? "https://www.homeownershipsf.org/buyerapplications/"
            : getHousingCounselorsPath()
        }
        className={"w-full"}
      >
        {isListingRental
          ? t("housingCounselor.findAHousingCounselor")
          : t("listings.apply.visitHomeownershipSf")}
      </LinkButton>
    </SidebarBlock>
  )

  const fcfsNoLotteryRequired = () => {
    return (
      <div className="border-b">
        <Card className="fcfs-no-lottery">
          <CardHeader className="font-bold fcfs-no-lottery-header">
            {t("listings.fcfs.bmrSales.noLotteryRequired.header")}
          </CardHeader>
          <CardSection className="fcfs-no-lottery-section">
            {t("listings.fcfs.bmrSales.noLotteryRequired.section")}
          </CardSection>
          <CardFooter className="ml-6 mb-6 underline fcfs-no-lottery-section">
            <Link
              href="https://www.sf.gov/step-by-step/buy-home-without-entering-lottery"
              hideExternalLinkIcon={true}
            >
              {t("listings.fcfs.bmrSales.noLotteryRequired.footer")}
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <ul>
      <ListingDetailItem
        imageAlt={""}
        imageSrc={imageSrc}
        title={t("listings.process.header")}
        subtitle={t("listings.process.subheader")}
        hideHeader={true}
        desktopClass="header-hidden"
      >
        <aside className="w-full static md:absolute md:right-0 md:w-1/3 md:top-0 sm:w-2/3 md:ml-2 h-full md:border border-solid bg-white">
          <div className="hidden md:block">
            <ListingDetailsApplicationDate listing={listing} />
            {isFcfsListing(listing) && fcfsNoLotteryRequired()}
            <ListingDetailsLotteryInfo listing={listing} />
            <ListingDetailsLotteryResults listing={listing} />
            {/* ListingDetailsWaitlist gets rendered in a different order due to info architecture
          importance in different states */}
            {!isApplicationOpen && <ListingDetailsWaitlist listing={listing} />}
            {isApplicationOpen && <ListingDetailsInfoSession listing={listing} />}
            {(isListingRental || !seeTheUnitEnabled) && (
              <ListingDetailsOpenHouses listing={listing} />
            )}
            {isApplicationOpen && <ListingDetailsWaitlist listing={listing} />}
            <ListingDetailsApply listing={listing} />
            {isSaleListing && seeTheUnitEnabled && <ListingDetailsSeeTheUnit listing={listing} />}
            {isApplicationOpen && needHelpBlock}
            {isSaleListing && listing.Expected_Move_in_Date && expectedMoveInDateBlock}
            <ListingDetailsProcess listing={listing} isApplicationOpen={isApplicationOpen} />
          </div>
        </aside>
      </ListingDetailItem>
    </ul>
  )
}
