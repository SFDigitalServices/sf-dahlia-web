import React, { useContext, useEffect, useState } from "react"
import dayjs from "dayjs"
import {
  AdditionalFees,
  ApplicationStatus,
  ApplicationStatusType,
  ContentAccordion,
  Description,
  EventSection,
  ExpandableText,
  ImageCard,
  InfoCard,
  ListingDetailItem,
  ListingDetails,
  ListSection,
  LoadingOverlay,
  MarkdownSection,
  Message,
  NavigationContext,
  PreferencesList,
  SiteAlert,
  t,
  Waitlist,
} from "@bloom-housing/ui-components"

import { ConfigContext } from "../../lib/ConfigContext"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { getListing } from "../../api/listingApiService"
import { getReservedCommunityType, renderInlineWithInnerHTML } from "../../util/languageUtil"
import { stripMostTags } from "../../util/filterUtil"
import {
  getListingAddressString,
  getListingImageCardStatuses,
  RailsListing,
} from "../../modules/listings/SharedHelpers"
import { ListingEvent } from "../../api/types/rails/listings/BaseRailsListing"
import bloomTheme from "../../../../tailwind.config"

const ListingDetail = () => {
  const alertClasses = "flex-grow mt-6 max-w-6xl w-full"
  const { getAssetPath } = useContext(ConfigContext)
  const { router } = useContext(NavigationContext)

  const [listing, setListing] = useState<RailsListing>(null)

  const getEventTimeString = (listingEvent: ListingEvent) => {
    if (listingEvent.Start_Time) {
      return listingEvent.End_Time
        ? `${listingEvent.Start_Time} - ${listingEvent.End_Time}`
        : listingEvent.Start_Time
    }
    return ""
  }

  const getEventNote = (listingEvent: ListingEvent) => {
    return (
      <div className="flex flex-col">
        {listingEvent.Venue && <span>{listingEvent.Venue}</span>}
        {listingEvent.Street_Address && listingEvent.City && (
          <span>{`${listingEvent.Street_Address}, ${listingEvent.City}`}</span>
        )}
      </div>
    )
  }

  const getImage = () => {
    return (
      <header className="image-card--leader">
        <ImageCard
          imageUrl={listing?.imageURL}
          title={listing.Name}
          href={`/listings/${listing.listingID}`}
          tagLabel={getReservedCommunityType(listing.Reserved_community_type) ?? undefined}
        />
        <div className="p-3">
          <p className="font-alt-sans uppercase tracking-widest text-sm font-semibold">
            {getListingAddressString(listing)}
          </p>
          <p className="text-gray-700 text-base">{listing.Developer}</p>
          <p className="text-xs">
            <a href={"/"} target="_blank" aria-label="Opens in new window">
              View on Map
            </a>
          </p>
        </div>
      </header>
    )
  }

  useEffect(() => {
    void getListing(router.pathname.split("/")[2]).then((listing: RailsListing) => {
      setListing(listing)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getSidebar = () => {
    const isApplicationOpen = new Date(listing.Application_Due_Date) > new Date()

    return (
      <ListingDetailItem
        imageAlt={""}
        imageSrc={""}
        title={"Process"}
        subtitle={"Process subtitle"}
        hideHeader={true}
        desktopClass="header-hidden"
      >
        <aside className="w-full static md:absolute md:right-0 md:w-1/3 md:top-0 sm:w-2/3 md:ml-2 h-full md:border border-solid bg-white">
          <div className="hidden md:block">
            <ApplicationStatus
              content={t(
                isApplicationOpen
                  ? "listingDetails.applicationDeadline.open"
                  : "listingDetails.applicationDeadline.closed",
                {
                  date: dayjs(listing.Application_Due_Date).format("MMM DD, YYYY"),
                  time: dayjs(listing.Application_Due_Date).format("h:mm A"),
                }
              )}
              iconColor={!isApplicationOpen && bloomTheme.theme.colors.red["700"]}
              status={isApplicationOpen ? ApplicationStatusType.Open : ApplicationStatusType.Closed}
            />

            {dayjs(listing.Application_Due_Date) > dayjs() && (
              <>
                {listing.Information_Sessions?.map((informationSession) => {
                  return (
                    <EventSection
                      events={[
                        {
                          dateString: dayjs(informationSession.Date).format("MMMM DD"),
                          timeString: getEventTimeString(informationSession),
                          note: getEventNote(informationSession),
                        },
                      ]}
                      headerText={"Information Sessions"}
                    />
                  )
                })}
                {listing.Open_Houses?.length && (
                  <EventSection
                    events={listing.Open_Houses?.map((openHouse) => {
                      return {
                        dateString: dayjs(openHouse.Date).format("MMMM DD"),
                        timeString: getEventTimeString(openHouse),
                        note: getEventNote(openHouse),
                      }
                    })}
                    headerText={"Open Houses"}
                  />
                )}
                {/* TODO: Bloom prop changes for get and submit application sections */}
              </>
            )}
            <Waitlist
              isWaitlistOpen={!!listing.Maximum_waitlist_size || !!listing.Total_waitlist_openings}
              waitlistCurrentSize={listing.Units_Available}
              waitlistOpenSpots={listing.Total_waitlist_openings}
              waitlistMaxSize={listing.Maximum_waitlist_size}
            />
            {!!listing.Lottery_Date &&
              dayjs(listing.Lottery_Date) > dayjs() &&
              !listing.LotteryResultsURL && (
                <EventSection
                  events={[
                    {
                      dateString: dayjs(listing.Lottery_Date).format("MMMM DD, YYYY"),
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
            {/* TODO: Bloom prop changes <DownloadLotteryResults resultsDate={"January 1st, 2022"} pdfURL={""} /> */}
            {/* TODO: Bloom prop changes <WhatToExpect listing={null} /> */}
            {/* TODO: Bloom prop changes <LeasingAgent listing={null} />  */}
          </div>
        </aside>
      </ListingDetailItem>
    )
  }

  const getBodyAndSidebar = () => {
    return (
      <ListingDetails>
        <ListingDetailItem
          imageAlt={""}
          imageSrc={""}
          title={"Eligibility"}
          subtitle={"Income, occupancy, preferences, subsides"}
          desktopClass="bg-primary-lighter"
        >
          <ListSection
            title={"Household Maximum Income"}
            subtitle={
              "For income calculations, household size includes everyone (all ages) living in the unit."
            }
          >
            {/* TODO: Build unit summaries */}
          </ListSection>
          <ListSection
            title={"Occupancy"}
            subtitle={
              "Occupancy limits for this building differ from household size, and do not include children under 6."
            }
          >
            {/* TODO: Build unit summaries */}
          </ListSection>
          <ListSection
            title={"Lottery Preferences"}
            subtitle={
              "Anyone may enter the housing lottery for this listing. If your household has one of the following preferences, you will be considered in the order shown here. Each preference holder will be reviewed in lottery rank order."
            }
          >
            <>
              <PreferencesList
                listingPreferences={listing.Listing_Lottery_Preferences.map((preference, index) => {
                  return {
                    title: preference.Lottery_Preference.Name,
                    subtitle: `Up to ${preference.Available_Units} unit(s) available`,
                    ordinal: index + 1,
                  }
                })}
              />
              <p className="text-gray-700 text-tiny">
                {
                  "After all preference holders have been considered, any remaining units will be available to qualified applicants in lottery order."
                }
              </p>
            </>
          </ListSection>
          <ListSection
            title={"Rental Assistance"}
            subtitle={
              "Section 8 housing vouchers and other valid rental assistance programs can be used for this property. In the case of a valid rental subsidy, the required minimum income will be based on the portion of the rent that the tenant pays after use of the subsidy."
            }
          />
          <ListSection
            title={"Additional Eligibility Rules"}
            subtitle={"Applicants must also qualify under the rules of the building."}
          >
            {listing.Credit_Rating && (
              <InfoCard title={"Credit History"}>
                <ExpandableText className="text-sm text-gray-700">
                  {listing.Credit_Rating}
                </ExpandableText>
              </InfoCard>
            )}

            {listing.Eviction_History && (
              <InfoCard title={"Rental History"}>
                <ExpandableText className="text-sm text-gray-700">
                  {listing.Eviction_History}
                </ExpandableText>
              </InfoCard>
            )}

            <InfoCard title={"Criminal Background"}>
              <ExpandableText className="text-sm text-gray-700">
                Qualified applicants with criminal history will be considered for housing in
                compliance with Article 49 of the San Francisco Police Code: Fair Chance Ordinance.
              </ExpandableText>
            </InfoCard>
            <p>
              <a href={listing.Building_Selection_Criteria} target={"_blank"}>
                {"Find out more about Building Selection Criteria"}
              </a>
            </p>
          </ListSection>
        </ListingDetailItem>
        <ListingDetailItem
          imageAlt={"Image Alt"}
          imageSrc={""}
          title={"Features"}
          subtitle={"Amenities, unit details and additional fees"}
        >
          <div className="listing-detail-panel">
            <dl className="column-definition-list">
              <Description term={"Neighborhood"} description={listing.Neighborhood} />
              <Description term={"Built"} description={listing.Year_Built} />
              <Description term={"Parking"} description={listing.Parking_Information} />
              <Description term={"Smoking Policy"} description={listing.Smoking_Policy} />
              <Description term={"Pets Policy"} description={listing.Pet_Policy} />
              <Description term={"Property Amenities"} description={listing.Amenities} />
              <Description term={"Accessibility"} description={listing.Accessibility} />

              <Description term={"Unit Features"} description={""} />
            </dl>
            <AdditionalFees
              depositMin={listing.Deposit_Min?.toLocaleString()}
              depositMax={listing.Deposit_Max?.toLocaleString()}
              applicationFee={listing.Fee?.toLocaleString()}
              costsNotIncluded={listing.Costs_Not_Included}
              depositHelperText={"or one month's rent"}
            />
          </div>
        </ListingDetailItem>
        <ListingDetailItem
          imageAlt={""}
          imageSrc={""}
          title={"Neighborhood"}
          subtitle={"Location and transportation"}
        >
          Map
        </ListingDetailItem>
        <ListingDetailItem
          imageAlt={""}
          imageSrc={""}
          title={"Additional information"}
          subtitle={"Required documents and selection criteria"}
        >
          <div className="listing-detail-panel">
            {listing.Listing_Other_Notes && (
              <div className="info-card bg-gray-100 border-0">
                <h3 className="text-serif-lg">{t("listings.special_notes")}</h3>
                <div className="text-sm">
                  {renderInlineWithInnerHTML(stripMostTags(listing.Listing_Other_Notes))}
                </div>
              </div>
            )}
            <div className="info-card bg-gray-100 border-0">
              <h3 className="text-serif-lg">{t("listings.required_documents")}</h3>
              <div className="text-sm">
                {renderInlineWithInnerHTML(stripMostTags(listing.Required_Documents))}
              </div>
            </div>
            <div className="info-card bg-gray-100 border-0">
              <h3 className="text-serif-lg">{t("listings.important_program_rules")}</h3>
              <div className="text-sm">
                {renderInlineWithInnerHTML(stripMostTags(listing.Legal_Disclaimers))}
              </div>
            </div>
            {listing.CC_and_R_URL && (
              <div className="info-card bg-gray-100 border-0">
                <h3 className="text-serif-lg">{t("listings.cc&r")}</h3>
                <div className="text-sm">
                  {renderInlineWithInnerHTML(stripMostTags(listing.CC_and_R_URL))}
                </div>
              </div>
            )}
            {/* TODO: implement once we've established needs for sales listings
              {listing.isSale && (
                <div className="info-card bg-gray-100 border-0">
                  <h3 className="text-serif-lg">For the Buyer's Realtor</h3>
                  {listing.Allows_Realtor_Commission ? (
                    display realtor_commission_header
                    realtorComissionMessage
                    {listing.Realtor_Commission_Info && realtor_commission_how_to}
                  ) : display realtor_commission_not_eligible message}
                </div>
              )}
            */}
            {listing.Repricing_Mechanism && (
              <div className="info-card bg-gray-100 border-0">
                <h3 className="text-serif-lg">{t("listings.re_pricing")}</h3>
                <div className="text-sm">
                  {renderInlineWithInnerHTML(stripMostTags(listing.Repricing_Mechanism))}
                </div>
              </div>
            )}
          </div>
        </ListingDetailItem>

        {getSidebar()}
        <div className="listing-detail-panel">
          <div className="info-card flex">
            {/* TODO: do we have a class for serifs but smaller we can enable? */}
            <p className="text-serif-lg">{t("listings.monitored_by_mohcd")}</p>
            <img
              alt={t("listings.equal_housing_opportunity_logo")}
              src={getAssetPath("logo-equal.png")}
            />
          </div>
        </div>
      </ListingDetails>
    )
  }

  const getAccordionTitle = () => {
    return (
      <span className={"flex w-full justify-between items-center"}>
        <span className={"flex items-center"}>
          <span className={"font-serif text-3xl font-medium leading-4 pr-2"}>#</span> person in
          household
        </span>
      </span>
    )
  }

  const getAMISection = () => {
    /* TODO: Build unit summaries */
    return (
      <div className="w-full md:w-2/3 md:mt-6 md:mb-6 md:px-3 md:pr-8">
        {listing.Reserved_community_type && (
          <Message warning={true}>Reserved for: {listing.Reserved_community_type}</Message>
        )}
        <ContentAccordion
          customBarContent={getAccordionTitle()}
          customExpandedContent={<>Pricing table</>}
          accordionTheme={"gray"}
          barClass={"mt-4"}
        />
      </div>
    )
  }

  return (
    <LoadingOverlay isLoading={!listing}>
      <Layout>
        <div className="flex absolute w-full flex-col items-center border-0 border-t border-solid">
          <SiteAlert type="alert" className={alertClasses} />
          <SiteAlert type="success" className={alertClasses} timeout={30_000} />
        </div>
        {listing && (
          <article className="flex flex-wrap relative max-w-5xl m-auto w-full">
            {getImage()}
            {getAMISection()}
            {getBodyAndSidebar()}
          </article>
        )}
      </Layout>
    </LoadingOverlay>
  )
}

export default withAppSetup(ListingDetail)
