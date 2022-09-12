import React from "react"
import { getEventNote, RailsListing } from "../listings/SharedHelpers"
import dayjs from "dayjs"
import { isOpen, isSale } from "../../util/listingUtil"
import {
  EventSection,
  Contact,
  t,
  ExpandableSection,
  SidebarBlock,
} from "@bloom-housing/ui-components"
import { localizedFormat, renderInlineMarkup } from "../../util/languageUtil"

export interface ListingDetailsProcessProps {
  listing: RailsListing
}

export const ListingDetailsProcess = ({ listing }: ListingDetailsProcessProps) => {
  const isApplicationOpen = isOpen(listing)
  const isListingSale = isSale(listing)

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
            headerText={t("listings.process.publicLottery")}
            sectionHeader={true}
          />
        )}
      <ExpandableSection
        content={t("emailer.submissionConfirmation.applicantsWillBeContacted")}
        expandableContent={
          <>
            <p>{t("f2ReviewTerms.p3")}</p>
            <p className={"mt-2 mb-2"}>{t("label.whatToExpectApplicationChosen")}</p>
          </>
        }
        strings={{
          title: t("label.whatToExpect"),
          readMore: t("label.readMore"),
          readLess: t("label.readLess"),
        }}
      />
      {(listing.Leasing_Agent_Email ||
        listing.Leasing_Agent_Name ||
        listing.Leasing_Agent_Phone ||
        listing.Office_Hours ||
        listing.Leasing_Agent_Title) && (
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
                    content: renderInlineMarkup(listing.Office_Hours),
                  },
                ]
              : undefined
          }
          contactEmail={listing.Leasing_Agent_Email}
          contactName={listing.Leasing_Agent_Name}
          contactPhoneNumber={
            listing.Leasing_Agent_Phone
              ? t("listings.call", { phoneNumber: listing.Leasing_Agent_Phone })
              : undefined
          }
          contactPhoneNumberNote={t("contactAgent.dueToHighCallVolume")}
          contactTitle={listing.Leasing_Agent_Title}
          strings={{
            email: t("label.emailAddress"),
            getDirections: t("label.getDirections"),
          }}
        />
      )}
      {isListingSale && (
        <SidebarBlock title={t("listings.housingProgram")}>
          <a href={`https://sfmohcd.org/for-buyers`} target="_blank" className="text-base">
            {t("listings.belowMarketRate")}
          </a>
        </SidebarBlock>
      )}
      {isApplicationOpen && (
        <SidebarBlock>
          <p className="">{`${t("t.listingUpdated")}: ${localizedFormat(
            listing.LastModifiedDate,
            "LL"
          )}`}</p>
          {listing.Multiple_Listing_Service_URL && (
            <p className="mt-1">
              <a href={`https://sfmohcd.org/for-buyers`} target="_blank" className="">
                {t("listings.process.seeThisUnitOnMls")}
              </a>
            </p>
          )}
        </SidebarBlock>
      )}
    </>
  )
  /* TODO: Bloom prop changes <DownloadLotteryResults resultsDate={"January 1st, 2022"} pdfURL={""} /> */
}
