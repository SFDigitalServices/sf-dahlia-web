import React from "react"
import { RailsListing } from "../listings/SharedHelpers"
import { ApplicationStatus, ApplicationStatusType, Icon, t } from "@bloom-housing/ui-components"
import { localizedFormat } from "../../util/languageUtil"
import dayjs from "dayjs"
import { LISTING_TYPE_FIRST_COME_FIRST_SERVED } from "../constants"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { isFcfsSalesListing, isOpen } from "../../util/listingUtil"
import bloomTheme from "../../../../tailwind.config"
import { Message } from "@bloom-housing/ui-seeds"

export interface ListingDetailsApplicationDateProps {
  listing: RailsListing
}

export const formatTime = (time: string) => {
  const formattedTime = dayjs(time).format("h:mm")
  const hour = Number(dayjs(time).format("H"))
  // \u00A0 is a non-breaking space
  const suffix = hour >= 12 ? "\u00A0PM" : "\u00A0AM"
  return `${formattedTime}${suffix}`
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
          time: formatTime(datetime),
        }
      )}
    />
  )
}

const getStatusFcfs = (listing: RailsListing) => {
  const isClosed = !listing.Accepting_Online_Applications
  const datetime = listing.Application_Start_Date_Time
  const showDateTime = new Date(listing.Application_Start_Date_Time) > new Date()

  const getMessage = () => {
    if (isClosed) {
      return t("listingDetails.applicationsClosed")
    } else {
      return showDateTime
        ? t("listingDetails.applicationsOpen.withDateTime", {
            date: localizedFormat(datetime, "LL"),
            time: formatTime(datetime),
          })
        : t("listingDetails.applicationsOpen")
    }
  }

  return <StatusMessage isClosed={isClosed} message={getMessage()} />
}

const ListingDetailsStatus = ({ listing }: { listing: RailsListing }) => {
  return listing.Listing_Type === LISTING_TYPE_FIRST_COME_FIRST_SERVED
    ? getStatusFcfs(listing)
    : getStatusLottery(listing)
}

export const ListingDetailsApplicationDate = ({ listing }: ListingDetailsApplicationDateProps) => {
  const isApplicationOpen = listing && isOpen(listing)

  const { unleashFlag: isSalesFcfsEnabled } = useFeatureFlag("FCFS", false)

  return (
    <div className="w-full mb-8 md:mb-0">
      {isSalesFcfsEnabled && isFcfsSalesListing(listing) ? (
        <ListingDetailsStatus listing={listing} />
      ) : (
        <div className="w-full mb-8 md:mb-0">
          <ApplicationStatus
            className="place-content-center"
            content={t(
              isApplicationOpen
                ? "listingDetails.applicationDeadline.open"
                : "listingDetails.applicationDeadline.closed",
              {
                date: localizedFormat(listing.Application_Due_Date, "ll"),
                time: dayjs(listing.Application_Due_Date).format("h:mm A"),
              }
            )}
            iconColor={!isApplicationOpen && bloomTheme.theme.colors.red["700"]}
            status={isApplicationOpen ? ApplicationStatusType.Open : ApplicationStatusType.Closed}
          />
        </div>
      )}
    </div>
  )
}
