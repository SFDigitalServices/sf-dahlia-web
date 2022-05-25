import React from "react"
import { getEventNote, RailsListing } from "../listings/SharedHelpers"
import dayjs from "dayjs"
import { EventSection, Contact, t } from "@bloom-housing/ui-components"
import { localizedFormat } from "../../util/languageUtil"

export interface ListingDetailsProcessProps {
  listing: RailsListing
}

export const ListingDetailsProcess = ({ listing }: ListingDetailsProcessProps) => {
  return (
    <>
      {!!listing.Lottery_Date &&
        dayjs(listing.Lottery_Date) > dayjs() &&
        !listing.LotteryResultsURL && (
          <EventSection
            events={[
              {
                dateString: localizedFormat(listing.Lottery_Date, "LL"),
                timeString: dayjs(listing.Lottery_Date).format("hh:mma"),
                note: getEventNote({
                  City: listing.Lottery_City,
                  Street_Address: listing.Lottery_Street_Address,
                  Venue: listing.Lottery_Venue,
                }),
              },
            ]}
            headerText={"Public Lottery"}
            sectionHeader={true}
          />
        )}
      {/* <GetApplication /> */}
      {/* <SubmitApplication /> */}
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
        contactPhoneNumber={`Call ${listing.Leasing_Agent_Phone}`}
        contactPhoneNumberNote={t("contactAgent.dueToHighCallVolume")}
        contactTitle={listing.Leasing_Agent_Title}
        strings={{
          email: t("label.emailAddress"),
          getDirections: t("label.getDirections"),
        }}
      />
    </>
  )
  /* TODO: Bloom prop changes <DownloadLotteryResults resultsDate={"January 1st, 2022"} pdfURL={""} /> */
  /* TODO: Bloom prop changes <WhatToExpect listing={null} /> */
  /* TODO: Last updated */
}
