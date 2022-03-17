import React from "react"

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
} from "@bloom-housing/ui-components"

import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"

interface ListingDetailProps {
  assetPaths: unknown
}

const ListingDetail = (_props: ListingDetailProps) => {
  const alertClasses = "flex-grow mt-6 max-w-6xl w-full"
  // const { getAssetPath, listingsAlertUrl } = useContext(ConfigContext)
  // const { router } = useContext(NavigationContext)

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

  const mockAdditionalInfo = {
    Listing_Other_Notes: "",
    Required_Documents: (
      <p className="text-sm">
        Lottery winners will be required to fill out a building application and provide a copy of
        your current credit report, 3 most recent paystubs, current tax returns and W-2, and 3 most
        recent bank statements.
      </p>
    ),
    Legal_Disclaimers: (
      <p className="text-sm">
        Here are the legel disclaimers. Find out information{" "}
        <a href="sf.gov" target="blank">
          here
        </a>
        . So cool!
      </p>
    ),
    CC_and_R_URL: (
      <span>
        <p className="text-sm mb-10">
          The CC&R's explain the rules of the homeowners' association, and restrict how you can
          modify the property.
        </p>
        <a
          className="button"
          href="https://polarispacific.app.box.com/v/MiraSFDisclosures"
          target="_blank"
          aria-label="Opens in new window"
        >
          Download PDF
        </a>
      </span>
    ),
    Allows_Realtor_Commission: false,
    Realtor_Commission_Info: "",
    Repricing_Mechanism: (
      <p className="text-sm">
        When you sell a BMR unit, it will be resold at a restricted price that is affordable to the
        next qualified household. The household you sell to must meet the first‐time homebuyer,
        income and other qualifications for the program. Please review the{" "}
        <a
          href="https://sfmohcd.org/sites/default/files/Documents/MOH/Limited%20Equity%20Progam/SAMPLE%20LEP%20Loan%20Disclosure%20Book.pdf"
          target="_blank"
        >
          Limited Equity Loan Disclosure Book
        </a>{" "}
        and{" "}
        <a href="http://sf-moh.org/index.aspx?page=295" target="_blank">
          2018 Inclusionary Affordable Housing Program Monitoring and Procedures Manual
        </a>{" "}
        for specific information.{" "}
      </p>
    ),
  }

  const getImage = () => {
    return (
      <header className="image-card--leader">
        <ImageCard title={"Listing Name"} imageUrl={""} tagLabel={""} />
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
            <ApplicationStatus content={"Application Deadline Dec 31, 2022 at 6:00 PM"} />
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
            <EventSection
              events={[
                {
                  dateString: "January 1st, 2022",
                  timeString: "2:00pm",
                  note: "1234 Dahlia Avenue, San Francisco",
                },
              ]}
              headerText={"Open Houses"}
            />
            <Waitlist
              isWaitlistOpen={true}
              waitlistMaxSize={100}
              waitlistCurrentSize={25}
              waitlistOpenSpots={75}
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
            {mockAdditionalInfo.Listing_Other_Notes && (
              <div className="info-card bg-gray-100 border-0">
                <h3 className="text-serif-lg">Special Notes</h3>
                {mockAdditionalInfo.Required_Documents}
              </div>
            )}
            <div className="info-card bg-gray-100 border-0">
              <h3 className="text-serif-lg">Required Documents</h3>
              {mockAdditionalInfo.Required_Documents}
            </div>
            <div className="info-card bg-gray-100 border-0">
              <h3 className="text-serif-lg">Important Program Rules</h3>
              {mockAdditionalInfo.Legal_Disclaimers}
            </div>
            {mockAdditionalInfo.CC_and_R_URL && (
              <div className="info-card bg-gray-100 border-0">
                <h3 className="text-serif-lg">Covenants, Conditions and Restrictions (CC&R's)</h3>
                {mockAdditionalInfo.CC_and_R_URL}
              </div>
            )}
            {/*
            {listing.isSale && (
            <div className="info-card bg-gray-100 border-0">
              <h3 className="text-serif-lg">For the Buyer's Realtor</h3>
              {mockAdditionalInfo.Allows_Realtor_Commission ? (
                display realtor_commission_header
                realtorComissionMessage
                {mockAdditionalInfo.Realtor_Commission_Info && realtor_commission_how_to}
              ) : display realtor_commission_not_eligible message}
            </div>
            )}
            */}
            {mockAdditionalInfo.Repricing_Mechanism && (
              <div className="info-card bg-gray-100 border-0">
                <h3 className="text-serif-lg">Resale Price Restrictions</h3>
                {mockAdditionalInfo.Repricing_Mechanism}
              </div>
            )}
          </div>
        </ListingDetailItem>
        {getSidebar()}
        <div className="listing-detail-panel">
          <div className="info-card flex">
            {/* TODO: do we have a class for serifs but smaller we can enable? */}
            <p className="text-serif-lg">
              Monitored by the Mayor's Office of Housing & Community Development
            </p>
            <img
              alt="Equal Housing Opportunity Logo"
              src="/assets/logo-equal-784f0277ac265fa4f14d489618f11b326fcdf72d4ce37b4d83607b3b0c37c6b1.png"
            />
          </div>
        </div>
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
    <Layout>
      <div className="flex absolute w-full flex-col items-center border-0 border-t border-solid">
        <SiteAlert type="alert" className={alertClasses} />
        <SiteAlert type="success" className={alertClasses} timeout={30_000} />
      </div>
      <article className="flex flex-wrap relative max-w-5xl m-auto w-full">
        {getImage()}
        {getAMISection()}
        {getBodyAndSidebar()}
      </article>
    </Layout>
  )
}

export default withAppSetup(ListingDetail)
