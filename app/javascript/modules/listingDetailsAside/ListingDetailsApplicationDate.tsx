import React from "react"
import { RailsListing } from "../listings/SharedHelpers"
import { Icon, t } from "@bloom-housing/ui-components"
import { Message } from "@bloom-housing/ui-seeds"
import { localizedFormat } from "../../util/languageUtil"
import dayjs from "dayjs"

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
  const isApplicationNotYetOpen = listing.Listing_State === "Not yet open"
  const isApplicationClosed = listing.Listing_State === "Closed"
  const isFcfs = listing.Listing_Type === "First Come, First Served"

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
          {isFcfs ||
            (!isApplicationNotYetOpen && (
              <>
                {": "}
                <span className="font-bold">
                  {localizedFormat(listing.Application_Due_Date, "LL")}
                </span>
              </>
            ))}
        </div>
        {isFcfs ||
          (!isApplicationNotYetOpen && (
            <div className="font-bold">
              {dayjs(listing.Application_Due_Date).format("h:mm A")}{" "}
              {t("listingDetails.applicationsDeadline.timezone")}
            </div>
          ))}
      </Message>
    </div>
  )
}
