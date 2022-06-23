import React from "react"
import { RailsListing } from "../listings/SharedHelpers"
import { Contact, ListingDetailItem, Mobile, t } from "@bloom-housing/ui-components"
import { ListingDetailsLotteryResults } from "./ListingDetailsLotteryResults"
import { isLotteryComplete } from "../../util/listingUtil"

export interface ListingDetailsLotteryProps {
  imageSrc: string
  listing: RailsListing
}

export const MobileListingDetailsLottery = ({ imageSrc, listing }: ListingDetailsLotteryProps) => {
  return (
    listing &&
    isLotteryComplete(listing) && (
      <Mobile>
        <ListingDetailItem
          imageAlt={""}
          imageSrc={imageSrc}
          title={t("lottery")}
          subtitle={t("lottery.lotteryInfoSubheader")}
        >
          <ListingDetailsLotteryResults listing={listing} />
          {/* TODO: add open houses */}
          {/* TODO: add what to expect */}
          <Contact
            sectionTitle={t("contactAgent.contact")}
            contactAddress={{
              street: listing.Leasing_Agent_Street,
              city: listing.Leasing_Agent_City,
              state: listing.Leasing_Agent_State,
              zipCode: listing.Leasing_Agent_Zip,
            }}
            additionalInformation={
              listing.Office_Hours
                ? [
                    {
                      title: t("contactAgent.officeHours"),
                      content: listing.Office_Hours,
                    },
                  ]
                : undefined
            }
            contactEmail={listing.Leasing_Agent_Email}
            contactName={listing.Leasing_Agent_Name}
            contactPhoneNumber={t("listings.call", { phoneNumber: listing.Leasing_Agent_Phone })}
            contactPhoneNumberNote={t("contactAgent.dueToHighCallVolume")}
            contactTitle={listing.Leasing_Agent_Title}
            strings={{
              email: t("label.emailAddress"),
              getDirections: t("label.getDirections"),
            }}
          />
          {/* TODO: add housing program */}
        </ListingDetailItem>
      </Mobile>
    )
  )
}
