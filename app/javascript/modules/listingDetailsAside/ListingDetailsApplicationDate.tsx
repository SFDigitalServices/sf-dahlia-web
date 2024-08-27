import React from "react"
import { RailsListing } from "../listings/SharedHelpers"
import { Icon, t } from "@bloom-housing/ui-components"
import { Message } from "@bloom-housing/ui-seeds"
import { localizedFormat } from "../../util/languageUtil"
import dayjs from "dayjs"
import { LISTING_STATES, LISTING_TYPE_FIRST_COME_FIRST_SERVED } from "../constants"

export interface ListingDetailsApplicationDateProps {
  listing: RailsListing
}

const getMessage = (isApplicationClosed: boolean, isFcfs: boolean) => {
  if (!isApplicationClosed) {
    return t(isFcfs ? "listingDetails.applicationsOpen" : "listingDetails.applicationsDeadline")
  }
  return t("listingDetails.applicationsClosed")
}

export const formatTime = (time: string) => {
  const formattedTime = dayjs(time).format("h:mm")
  const hour = Number(dayjs(time).format("H"))
  // \u00A0 is a non-breaking space
  const suffix = hour >= 12 ? "\u00A0PM" : "\u00A0AM"
  return `${formattedTime}${suffix}`
}

export const ListingDetailsApplicationDate = ({ listing }: ListingDetailsApplicationDateProps) => {
  const isApplicationNotYetOpen = listing.Listing_State === LISTING_STATES.NOT_YET_OPEN
  const isApplicationClosed = listing.Listing_State === LISTING_STATES.CLOSED
  const isFcfs = listing.Listing_Type === LISTING_TYPE_FIRST_COME_FIRST_SERVED
  const date = isFcfs
    ? localizedFormat(listing.Application_Start_Date_Time, "LL")
    : localizedFormat(listing.Application_Due_Date, "LL")
  const time = isFcfs
    ? formatTime(listing.Application_Start_Date_Time)
    : formatTime(listing.Application_Due_Date)

  const showDateAndTime = isFcfs ? !!isApplicationNotYetOpen : true

  return (
    <div className="w-full mb-8 md:mb-0">
      <Message
        fullwidth
        className="justify-start leading-5"
        variant={isApplicationClosed ? "alert" : "primary"}
        customIcon={
          <Icon fill={isApplicationClosed ? "red-700" : ""} symbol="clock" size="medium" />
        }
      >
        {getMessage(isApplicationClosed, isFcfs)}
        {showDateAndTime && (
          <span className="font-semibold">
            {": "}
            {date} {time}
            {t("listingDetails.applicationsDeadline.timezone")}
          </span>
        )}
      </Message>
    </div>
  )
}
