import React from "react"
import Markdown from "markdown-to-jsx"
import { ApplicationStatusType, StatusBarType, t } from "@bloom-housing/ui-components"
import { areLotteryResultsShareable, getTagContent } from "../../util/listingUtil"
import { localizedFormat } from "../../util/languageUtil"
import type RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import type RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"
import type { ListingEvent } from "../../api/types/rails/listings/BaseRailsListing"
import fallbackImg from "../../../assets/images/bg@1200.jpg"
import "./SharedHelpers.scss"

export type RailsListing = RailsSaleListing | RailsRentalListing

// Returns every status bar under the image card for one listing
export const getListingImageCardStatuses = (
  listing: RailsListing,
  hasFiltersSet: boolean
): StatusBarType[] => {
  const statuses: StatusBarType[] = []
  const formattedDueDateString = localizedFormat(listing.Application_Due_Date, "LL")
  const lotteryResultsDateString = localizedFormat(listing.Lottery_Results_Date, "LL")

  if (new Date(listing.Application_Due_Date) < new Date()) {
    if (!areLotteryResultsShareable(listing)) {
      statuses.push({
        status: ApplicationStatusType.Closed,
        content: `${t("listings.applicationsClosed")}: ${formattedDueDateString}`,
        hideIcon: true,
      })
    }
    statuses.push({
      status: ApplicationStatusType.PostLottery,
      content: `${t("listings.lotteryResults.cardTitle")}: ${lotteryResultsDateString}`,
      hideIcon: true,
    })
  } else {
    if (hasFiltersSet && listing.Does_Match) {
      return [
        {
          status: ApplicationStatusType.Matched,
          content: `${t("listings.eligibilityCalculator.matched")}`,
          hideIcon: false,
          iconType: "check",
        },
      ]
    } else if (hasFiltersSet && !listing.Does_Match) {
      return [
        {
          status: ApplicationStatusType.PostLottery,
          content: `${t("listings.eligibilityCalculator.notAMatch")}`,
          hideIcon: true,
        },
      ]
    } else {
      return [
        {
          status: ApplicationStatusType.Open,
          content: `${t("listings.applicationDeadline")}: ${formattedDueDateString}`,
        },
      ]
    }
  }
  return statuses
}

// Get imageCardProps for a given listing
export const getImageCardProps = (listing: RailsListing, hasFiltersSet?: boolean) => {
  const imageUrl =
    listing?.Listing_Images?.length > 0
      ? listing.Listing_Images[0].Image_URL
      : listing?.imageURL ?? fallbackImg

  return {
    imageUrl: imageUrl,
    href: `/listings/${listing.listingID}`,
    tags: getTagContent(listing),
    statuses: getListingImageCardStatuses(listing, hasFiltersSet),
    description: `${listing.Building_Name} Building`,
  }
}

export const getEventNote = (listingEvent: ListingEvent) => {
  if (!listingEvent.Venue) return null
  return (
    <div className="flex flex-col">
      {listingEvent.Venue && (
        <span className="links-space translate">
          <Markdown>{listingEvent.Venue}</Markdown>
        </span>
      )}
      {listingEvent.Street_Address && listingEvent.City && (
        <span>{`${listingEvent.Street_Address}, ${listingEvent.City}`}</span>
      )}
    </div>
  )
}
