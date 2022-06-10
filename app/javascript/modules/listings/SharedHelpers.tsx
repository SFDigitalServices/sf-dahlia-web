import React from "react"
import { ApplicationStatusType, StatusBarType, t } from "@bloom-housing/ui-components"
import { areLotteryResultsShareable } from "../../util/listingUtil"
import { getReservedCommunityType, localizedFormat } from "../../util/languageUtil"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"
import { ListingEvent } from "../../api/types/rails/listings/BaseRailsListing"

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

export const getListingAddressString = (listing: RailsListing) => {
  return (
    (listing.Building_Street_Address &&
      listing.Building_City &&
      listing.Building_State &&
      listing.Building_Zip_Code && (
        <span>
          {listing.Building_Street_Address}, {listing.Building_City}{" "}
          <abbr title="California">{listing.Building_State}</abbr>, {listing.Building_Zip_Code}
        </span>
      )) ??
    ""
  )
}

// Get imageCardProps for a given listing
export const getImageCardProps = (listing, hasFiltersSet?: boolean) => ({
  imageUrl: listing?.imageURL,
  href: `/listings/${listing.listingID}`,
  tags: listing.Reserved_community_type
    ? [{ text: getReservedCommunityType(listing.Reserved_community_type) }]
    : undefined,
  statuses: getListingImageCardStatuses(listing, hasFiltersSet),
})

export const getEventNote = (listingEvent: ListingEvent) => {
  return (
    <div className="flex flex-col">
      {listingEvent.Venue && <span>{listingEvent.Venue}</span>}
      {listingEvent.Street_Address && listingEvent.City && (
        <span>{`${listingEvent.Street_Address}, ${listingEvent.City}`}</span>
      )}
    </div>
  )
}
