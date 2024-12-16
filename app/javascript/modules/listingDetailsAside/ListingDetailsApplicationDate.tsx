import React from "react"
import { RailsListing } from "../listings/SharedHelpers"
import { Icon, t } from "@bloom-housing/ui-components"
import { localizedFormat, formatTimeOfDay } from "../../util/languageUtil"
import { getFcfsSalesListingState, isFcfsSalesListing, isOpen } from "../../util/listingUtil"
import { Message } from "@bloom-housing/ui-seeds"
import { ListingState } from "../listings/ListingState"

export interface ListingDetailsApplicationDateProps {
  listing: RailsListing
}

const StatusMessage = ({ isClosed, message }: { isClosed: boolean; message: string }) => {
  return (
    <Message
      fullwidth
      className="justify-start leading-5"
      variant={isClosed ? "alert" : "primary"}
      customIcon={<Icon fill={isClosed ? "red-700" : ""} symbol="clock" size="medium" />}
    >
      {message}
    </Message>
  )
}

const getStatusLottery = (listing: RailsListing) => {
  const isClosed = !isOpen(listing)
  const datetime = listing.Application_Due_Date
  return (
    <StatusMessage
      isClosed={isClosed}
      message={t(
        isClosed
          ? "listingDetails.applicationsClosed.withDateTime"
          : "listingDetails.applicationsDeadline.withDateTime",
        {
          date: localizedFormat(datetime, "LL"),
          time: formatTimeOfDay(datetime),
        }
      )}
    />
  )
}

const getStatusFcfs = (listing: RailsListing) => {
  const listingState = getFcfsSalesListingState(listing)
  const datetime = listing.Application_Start_Date_Time

  const getMessage = () => {
    if (listingState === ListingState.Closed) {
      return t("listingDetails.applicationsClosed")
    } else {
      return listingState === ListingState.NotYetOpen
        ? t("listingDetails.applicationsOpen.withDateTime", {
            date: localizedFormat(datetime, "LL"),
            time: formatTimeOfDay(datetime),
          })
        : t("listingDetails.applicationsOpen")
    }
  }

  return <StatusMessage isClosed={listingState === ListingState.Closed} message={getMessage()} />
}

const ListingDetailsStatus = ({ listing }: { listing: RailsListing }) => {
  return isFcfsSalesListing(listing) ? getStatusFcfs(listing) : getStatusLottery(listing)
}

export const ListingDetailsApplicationDate = ({ listing }: ListingDetailsApplicationDateProps) => {
  return (
    <div className="w-full mb-8 md:mb-0">
      <ListingDetailsStatus listing={listing} />
    </div>
  )
}
