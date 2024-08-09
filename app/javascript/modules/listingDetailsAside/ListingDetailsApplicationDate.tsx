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

export const ListingDetailsApplicationDate = ({ listing }: ListingDetailsApplicationDateProps) => {
  const isApplicationNotYetOpen = listing.Listing_State === LISTING_STATES.NOT_YET_OPEN
  const isApplicationClosed = listing.Listing_State === LISTING_STATES.CLOSED
  const isFcfs = listing.Listing_Type === LISTING_TYPE_FIRST_COME_FIRST_SERVED
  const date = isFcfs
    ? localizedFormat(listing.Application_Start_Date_Time, "LL")
    : localizedFormat(listing.Application_Due_Date, "LL")
  const time = isFcfs
    ? dayjs(listing.Application_Start_Date_Time).format("h:mm A")
    : dayjs(listing.Application_Due_Date).format("h:mm A")

  const showDateAndTime = isFcfs ? !!isApplicationNotYetOpen : true

  return (
    <div className="w-full mb-8 md:mb-0">
      <Message
        className="place-content-center"
        variant={isApplicationClosed ? "alert" : "primary"}
        customIcon={
          <Icon fill={isApplicationClosed ? "red-700" : ""} symbol="clock" size="medium" />
        }
      >
        <div>
          <span>{getMessage(isApplicationClosed, isFcfs)}</span>
          {showDateAndTime && (
            <>
              {": "}
              <span className="font-bold">{date}</span>
            </>
          )}
        </div>
        {showDateAndTime && (
          <div className="font-bold">
            {time}
            {/* non-breaking space */}
            {"\u00A0"}
            {t("listingDetails.applicationsDeadline.timezone")}
          </div>
        )}
      </Message>
    </div>
  )
}
