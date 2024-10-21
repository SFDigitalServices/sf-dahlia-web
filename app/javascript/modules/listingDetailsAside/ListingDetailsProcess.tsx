import React from "react"
import { getEventNote, RailsListing } from "../listings/SharedHelpers"
import dayjs from "dayjs"
import { isFcfsSalesListing, isRental, isSale } from "../../util/listingUtil"
import {
  EventSection,
  Contact,
  t,
  ExpandableSection,
  SidebarBlock,
} from "@bloom-housing/ui-components"
import { getTranslatedString, localizedFormat, renderInlineMarkup } from "../../util/languageUtil"
import { ListingDetailsLotteryPreferenceLists } from "./ListingDetailsLotteryPreferenceLists"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
export interface ListingDetailsProcessProps {
  listing: RailsListing
  isApplicationOpen: boolean
}

const WhatToExpect = ({
  listing,
  isSalesFcfsEnabled,
}: {
  listing: RailsListing
  isSalesFcfsEnabled: boolean
}) => {
  if (isFcfsSalesListing(listing) && isSalesFcfsEnabled) {
    return null
  }
  return (
    <div className="border-b border-gray-400 md:border-b-0">
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
          readMore: t("label.showMore"),
          readLess: t("label.showLess"),
          buttonAriaLabel: t("listings.whatToExpect.showMore.aria"),
        }}
      />
    </div>
  )
}

export const ListingDetailsProcess = ({
  listing,
  isApplicationOpen,
}: ListingDetailsProcessProps) => {
  const isListingSale = isSale(listing)
  const isListingRental = isRental(listing)
  const { unleashFlag: isSalesFcfsEnabled } = useFeatureFlag("FCFS", false)

  return (
    <>
      {!!listing.Lottery_Date &&
        dayjs(listing.Lottery_Date) > dayjs() &&
        !listing.LotteryResultsURL &&
        isApplicationOpen && (
          <div className="border-b border-gray-400 md:border-b-0">
            <EventSection
              events={[
                {
                  dateString: localizedFormat(listing.Lottery_Date, "LL"),
                  timeString: dayjs(listing.Lottery_Date).format("hh:mma"),
                  note: getEventNote({
                    City: listing.Lottery_City,
                    Street_Address: listing.Lottery_Street_Address,
                    Venue: getTranslatedString(
                      listing.Lottery_Venue,
                      "Lottery_Venue__c",
                      listing.translations
                    ),
                  }),
                },
              ]}
              headerText={t("listings.process.publicLottery")}
              sectionHeader={true}
            />
          </div>
        )}
      <WhatToExpect listing={listing} isSalesFcfsEnabled={isSalesFcfsEnabled} />
      <ListingDetailsLotteryPreferenceLists
        listing={listing}
        isApplicationOpen={isApplicationOpen}
      />
      {(listing.Leasing_Agent_Email ||
        listing.Leasing_Agent_Name ||
        listing.Leasing_Agent_Phone ||
        listing.Office_Hours ||
        listing.Leasing_Agent_Title) &&
        (isListingRental || !isSalesFcfsEnabled) && (
          <div className="border-b border-gray-400 md:border-b-0 last:border-b-0">
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
                        content: (
                          <span className="translate">
                            {renderInlineMarkup(
                              getTranslatedString(
                                listing.Office_Hours,
                                "Office_Hours__c",
                                listing.translations
                              )
                            )}
                          </span>
                        ),
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
              contactTitle={getTranslatedString(
                listing.Leasing_Agent_Title,
                "Leasing_Agent_Title__c",
                listing.translations
              )}
              contactTitleClassname="translate"
              strings={{
                email: t("label.emailAddress"),
                getDirections: t("label.getDirections"),
              }}
            />
          </div>
        )}
      {isListingSale && (
        <div className="border-b border-gray-400 md:border-b-0 last:border-b-0">
          <SidebarBlock title={t("listings.housingProgram")}>
            <a href={`https://sfmohcd.org/for-buyers`} target="_blank" className="text-base">
              {t("listings.belowMarketRate")}
            </a>
          </SidebarBlock>
        </div>
      )}
      {isApplicationOpen && (
        <div className="border-b border-gray-400 md:border-b-0 last:border-b-0">
          <SidebarBlock>
            <p>{`${t("t.listingUpdated")}: ${localizedFormat(listing.LastModifiedDate, "LL")}`}</p>
            {listing.Multiple_Listing_Service_URL && (
              <p className="mt-1">
                <a href={listing.Multiple_Listing_Service_URL} target="_blank" className="">
                  {t("listings.process.seeThisUnitOnMls")}
                </a>
              </p>
            )}
          </SidebarBlock>
        </div>
      )}
    </>
  )
  /* TODO: Bloom prop changes <DownloadLotteryResults resultsDate={"January 1st, 2022"} pdfURL={""} /> */
}
