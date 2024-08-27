import React from "react"
import { ApplicationStatusType, StatusBarType, t } from "@bloom-housing/ui-components"
import { getTagContent, isFcfsListing, isLotteryCompleteDeprecated } from "../../util/listingUtil"
import { localizedFormat, renderInlineMarkup } from "../../util/languageUtil"
import type RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import type RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"
import type { ListingEvent } from "../../api/types/rails/listings/BaseRailsListing"
import fallbackImg from "../../../assets/images/bg@1200.jpg"
import "./SharedHelpers.scss"

export type RailsListing = RailsSaleListing | RailsRentalListing

const getMatchStatuses = (doesMatch: boolean): StatusBarType[] => {
  return doesMatch
    ? [
        {
          status: ApplicationStatusType.Matched,
          content: `${t("listings.eligibilityCalculator.matched")}`,
          hideIcon: false,
          iconType: "check",
        },
      ]
    : [
        {
          status: ApplicationStatusType.PostLottery,
          content: `${t("listings.eligibilityCalculator.notAMatch")}`,
          hideIcon: true,
        },
      ]
}

const getFcfsStatuses = (listing: RailsListing) => {
  const isFcfsApplicationNotYetOpen = false
  const isFcfsApplicationClosed = false

  const isListingClosed = isFcfsApplicationClosed
  const formattedDueDateString = localizedFormat(listing.Application_Start_Date_Time, "LL")

  return isListingClosed
    ? [
        {
          status: ApplicationStatusType.Closed,
          content: t("listingDirectory.listingStatusContent.applicationsClosed"),
          subContent: t("listingDirectory.listingStatusContent.subContent.firstComeFirstServed"),
          hideIcon: true,
        },
      ]
    : [
        {
          status: ApplicationStatusType.Open,
          content: isFcfsApplicationNotYetOpen
            ? `${t(
                "listingDirectory.listingStatusContent.applicationsOpen"
              )}: ${formattedDueDateString}`
            : t("listingDirectory.listingStatusContent.applicationsOpen"),
          subContent: t("listingDirectory.listingStatusContent.subContent.firstComeFirstServed"),
        },
      ]
}

const getLotteryStatuses = (listing: RailsListing): StatusBarType[] => {
  const formattedDueDateString = localizedFormat(listing.Application_Due_Date, "LL")

  if (new Date(listing.Application_Due_Date) < new Date()) {
    const statuses: StatusBarType[] = []
    if (!isLotteryCompleteDeprecated(listing)) {
      statuses.push({
        status: ApplicationStatusType.Closed,
        content: `${t(
          "listingDirectory.listingStatusContent.applicationsClosed"
        )}: ${formattedDueDateString}`,
        hideIcon: true,
      })
    }

    statuses.push({
      status: ApplicationStatusType.PostLottery,
      content: `${t(
        "listingDirectory.listingStatusContent.lotteryResultsPosted"
      )}: ${localizedFormat(listing.Lottery_Results_Date, "LL")}`,
      hideIcon: true,
    })

    return statuses
  } else {
    return [
      {
        status: ApplicationStatusType.Open,
        content: `${t(
          "listingDirectory.listingStatusContent.applicationDeadline"
        )}: ${formattedDueDateString}`,
      },
    ]
  }
}

// Returns every status bar under the image card for one listing
export const getListingStatuses = (
  listing: RailsListing,
  hasFiltersSet: boolean
): StatusBarType[] => {
  if (hasFiltersSet) {
    return getMatchStatuses(listing.Does_Match)
  }

  if (isFcfsListing(listing)) {
    return getFcfsStatuses(listing)
  }

  return getLotteryStatuses(listing)
}

/**
 * @deprecated In favor of getListingStatuses.
 *
 * Returns every status bar under the image card for one listing
 */
export const getListingImageCardStatuses = (
  listing: RailsListing,
  hasFiltersSet: boolean
): StatusBarType[] => {
  const statuses: StatusBarType[] = []
  const formattedDueDateString = localizedFormat(listing.Application_Due_Date, "LL")
  const lotteryResultsDateString = localizedFormat(listing.Lottery_Results_Date, "LL")

  if (new Date(listing.Application_Due_Date) < new Date()) {
    if (!isLotteryCompleteDeprecated(listing)) {
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
export const getImageCardProps = (
  listing: RailsListing,
  hasFiltersSet?: boolean,
  useUpdatedDirectoryStatuses: boolean = false
) => {
  const imageUrl =
    listing?.Listing_Images?.length > 0
      ? listing.Listing_Images[0].displayImageURL
      : listing?.imageURL ?? fallbackImg

  const imageDescription =
    listing?.Listing_Images?.length > 0
      ? listing.Listing_Images[0].Image_Description
      : `${listing.Building_Name} Building`
  return {
    imageUrl: imageUrl,
    href: `/listings/${listing.listingID}`,
    tags: getTagContent(listing),
    statuses: useUpdatedDirectoryStatuses
      ? getListingStatuses(listing, hasFiltersSet)
      : getListingImageCardStatuses(listing, hasFiltersSet),
    description: imageDescription,
  }
}

export const getEventNote = (listingEvent: ListingEvent) => {
  if (!listingEvent.Venue) return null
  return (
    <div className="flex flex-col">
      {listingEvent.Venue && (
        <span className="links-space translate">{renderInlineMarkup(listingEvent.Venue)}</span>
      )}
      {listingEvent.Street_Address && listingEvent.City && (
        <span>{`${listingEvent.Street_Address}, ${listingEvent.City}`}</span>
      )}
    </div>
  )
}
