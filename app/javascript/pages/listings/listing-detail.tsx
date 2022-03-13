import React, { useContext, useState, useEffect } from "react"
import dayjs from "dayjs"
import {
  SiteAlert,
  ListingDetails,
  ListingDetailItem,
  ImageCard,
  Message,
  GroupedTable,
  ApplicationStatus,
  DownloadLotteryResults,
  Waitlist,
  GetApplication,
  SubmitApplication,
  EventSection,
  ListSection,
  StandardTable,
  PreferencesList,
  InfoCard,
  ExpandableText,
  Description,
  AdditionalFees,
  MarkdownSection,
  NavigationContext,
  LoadingOverlay,
} from "@bloom-housing/ui-components"

import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { getListing } from "../../api/listingApiService"
import {
  RailsListing,
  getImageCardProps,
  getListingImageCardStatuses,
} from "../../modules/listings/SharedHelpers"

// interface ListingDetailProps {
//   assetPaths: unknown
// }

const ListingDetail = () => {
  const alertClasses = "flex-grow mt-6 max-w-6xl w-full"
  const { router } = useContext(NavigationContext)

  const [listing, setListing] = useState<RailsListing>(null)

  const mockHeaders = {
    name: "Name",
    dob: "Date of Birth",
  }

  const mockData = [
    {
      name: "Jim Halpert",
      dob: "05/01/1985",
    },
    {
      name: "Michael Scott",
      dob: "05/01/1975",
    },
  ]

  const getImage = () => {
    return (
      <header className="image-card--leader">
        <ImageCard {...getImageCardProps(listing)} />
        <div className="p-3">
          <p className="font-alt-sans uppercase tracking-widest text-sm font-semibold">Address</p>
          <p className="text-gray-700 text-base">Developer</p>
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
      console.log("response", listing)
      setListing(listing)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getSidebarApplySection = () => {
    return (
      <>
        <GetApplication
          onlineApplicationURL={"https://www.example.com"}
          applicationsOpen={true}
          applicationsOpenDate={"January 1st"}
          paperApplications={[{ fileURL: "https://www.example.com", languageString: "English" }]}
          paperMethod={false}
          postmarkedApplicationsReceivedByDate={"January 2nd"}
          applicationPickUpAddressOfficeHours={"Pick up office hours"}
          applicationPickUpAddress={{
            street: "Pick up street",
            city: "City",
            state: "State",
            zipCode: "Zip",
          }}
          listingStatus={"active" as any}
        />
        <SubmitApplication
          applicationMailingAddress={{
            street: "Mail in street",
            city: "City",
            state: "State",
            zipCode: "Zip",
          }}
          applicationDropOffAddress={{
            street: "Drop off street",
            city: "City",
            state: "State",
            zipCode: "Zip",
          }}
          applicationDropOffAddressOfficeHours={"Drop off office hours"}
          applicationOrganization={"Application organization"}
          postmarkedApplicationData={{
            postmarkedApplicationsReceivedByDate: "January 2nd",
            developer: "Developer",
            applicationsDueDate: "January 1st",
          }}
          listingStatus={"active" as any}
        />
      </>
    )
  }

  const getSidebar = () => {
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
            <ApplicationStatus {...getListingImageCardStatuses(listing, false)[0]} />
            {!(dayjs(listing.Application_Due_Date) > dayjs()) && (
              <>
                {listing.Open_Houses.map((openHouse) => {
                  return (
                    <EventSection
                      events={[
                        {
                          dateString: "January 1st, 2022",
                          timeString: "2:00pm",
                          note: openHouse.Venue,
                        },
                      ]}
                      headerText={"Open Houses"}
                    />
                  )
                })}
              </>
            )}
            <EventSection
              events={[
                {
                  dateString: "January 1st, 2022",
                  timeString: "2:00pm",
                  note: "1234 Dahlia Avenue, San Francisco",
                },
              ]}
              headerText={"Information Sessions"}
            />
            {/* TODO: Waitlist component needs to accept custom strings, custom number rows, custom bolded styling */}
            <Waitlist
              isWaitlistOpen={listing.hasWaitlist}
              waitlistCurrentSize={listing.Units_Available}
              waitlistOpenSpots={listing.Total_waitlist_openings}
            />

            <DownloadLotteryResults resultsDate={"January 1st, 2022"} pdfURL={""} />

            {getSidebarApplySection()}
          </div>

          {/* Needs Bloom backend dependencies removed, generalized
          <WhatToExpect listing={null} />
          <LeasingAgent listing={null} /> */}
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
            <StandardTable headers={mockHeaders} data={mockData} responsiveCollapse={true} />
          </ListSection>
          <ListSection
            title={"Occupancy"}
            subtitle={
              "Occupancy limits for this building differ from household size, and do not include children under 6."
            }
          >
            <StandardTable headers={mockHeaders} data={mockData} responsiveCollapse={true} />
          </ListSection>
          <ListSection
            title={"Rental Assistance"}
            subtitle={
              "Section 8 housing vouchers and other valid rental assistance programs can be used for this property."
            }
          />
          <ListSection
            title={"Lottery Preferences"}
            subtitle={
              "Anyone may enter the housing lottery for this listing. If your household has one of the following preferences, you will be considered in the order shown here. Each preference holder will be reviewed in lottery rank order."
            }
          >
            <>
              <PreferencesList
                listingPreferences={[
                  { title: "Title", subtitle: "Subtitle", description: "Description", ordinal: 1 },
                  { title: "Title", subtitle: "Subtitle", description: "Description", ordinal: 2 },
                ]}
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
              "Section 8 housing vouchers and other valid rental assistance programs can be used for this property."
            }
          />
          <ListSection
            title={"Additional Eligibility Rules"}
            subtitle={"Applicants must also qualify under the rules of the building."}
          >
            <InfoCard title={"Credit History"}>
              <ExpandableText className="text-sm text-gray-700">
                {"Credit history information"}
              </ExpandableText>
            </InfoCard>
            <InfoCard title={"Rental History"}>
              <ExpandableText className="text-sm text-gray-700">
                {"Rental history information"}
              </ExpandableText>
            </InfoCard>
            <InfoCard title={"Criminal Background"}>
              <ExpandableText className="text-sm text-gray-700">
                {"Criminal background information"}
              </ExpandableText>
            </InfoCard>
            <p>
              <a href={"https://www.example.com"}>
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
              <Description term={"Neighborhood"} description={"My Neighborhood"} />
              <Description term={"Built"} description={"2022"} />
              <Description term={"Smoking Policy"} description={"Non-smoking building"} />
              <Description term={"Pets Policy"} description={"Service animals allowed"} />
              <Description
                term={"Property Amenities"}
                description={"Underground parking, courtyard, bike room, business center"}
              />
              <Description term={"Unit Amenities"} description={"In-unit wahser/dryer"} />
              <Description term={"Accessibility"} description={"Elevator to all floors"} />
              {/*
              Needs Bloom backend dependencies removed, generalized
              <Description
                term={"Unit Features"}
                description={
                  <UnitTables
                    units={listing.units}
                    unitSummaries={listing?.unitsSummarized?.byUnitType}
                    disableAccordion={listing.disableUnitsAccordion}
                  />
                }
              /> */}
            </dl>
            <AdditionalFees
              depositMin={"2,102"}
              depositMax={"2,355"}
              applicationFee={"50"}
              costsNotIncluded={
                "Tenants pay for gas, electricity. For pet fees: Cat is allowed with a $500 refundable deposit, $250 non-refundable cleaning fee and a pet addendum. Dogs are not allowed in the building. One parking space per unit available for $175 a month."
              }
              depositHelperText={"or one month's rent"}
            />
          </div>
        </ListingDetailItem>
        <ListingDetailItem
          imageAlt={""}
          imageSrc={""}
          title={"Additional information"}
          subtitle={"Required documents and selection criteria"}
        >
          <div className="listing-detail-panel">
            <div className="info-card">
              <h3 className="text-serif-lg">Required Documents</h3>
              <p className="text-sm text-gray-700 m-0 p-0">
                <MarkdownSection>
                  Lottery winners will be required to fill out a building application and provide a
                  copy of your current credit report, 3 most recent paystubs, current tax returns
                  and W-2, and 3 most recent bank statements.
                </MarkdownSection>
              </p>
            </div>
          </div>
        </ListingDetailItem>
        {getSidebar()}
      </ListingDetails>
    )
  }

  const getAMISection = () => {
    return (
      <div className="w-full md:w-2/3 md:mt-6 md:mb-6 md:px-3 md:pr-8">
        <Message warning={true}>Reserved Type</Message>
        <GroupedTable headers={mockHeaders} data={[{ data: mockData }]} responsiveCollapse={true} />
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
