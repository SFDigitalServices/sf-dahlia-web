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
          onlineApplicationURL={""}
          applicationsOpen={true}
          applicationsOpenDate={"January 1st"}
          paperApplications={null}
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
        <aside className="w-full static md:absolute md:right-0 md:w-1/3 md:top-0 sm:w-2/3 md:ml-2 h-full md:border border-gray-400 bg-white">
          <div className="hidden md:block">
            <ApplicationStatus content={"content"} subContent={"subContent"} />
            <DownloadLotteryResults event={null} pdfUrl={""} />
            <Waitlist
              isWaitlistOpen={true}
              waitlistMaxSize={100}
              waitlistCurrentSize={25}
              waitlistOpenSpots={75}
            />
            {getSidebarApplySection()}
          </div>

          {/* <div className="mb-2 md:hidden">
            <OpenHouseEvent events={null} />
          </div> */}
          {/* <PublicLotteryEvent event={null} /> */}
          {/* <LotteryResultsEvent event={null} /> */}
          {/* <WhatToExpect listing={null} /> */}
          {/* <LeasingAgent listing={null} /> */}
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
          Eligibility content
        </ListingDetailItem>
        <ListingDetailItem
          imageAlt={""}
          imageSrc={""}
          title={"Features"}
          subtitle={"Amenities, unit details and additional fees"}
        >
          Features content
        </ListingDetailItem>
        <ListingDetailItem
          imageAlt={""}
          imageSrc={""}
          title={"Neighborhood"}
          subtitle={"Location and transportation"}
          desktopClass="bg-primary-lighter"
        >
          Neighborhood content
        </ListingDetailItem>
        <ListingDetailItem
          imageAlt={""}
          imageSrc={""}
          title={"Additional information"}
          subtitle={"Required documents and selection criteria"}
        >
          Additional information content
        </ListingDetailItem>
        {getSidebar()}
      </ListingDetails>
    )
  }

  const getAMISection = () => {
    return (
      <div className="w-full md:w-2/3 md:mt-6 md:mb-6 md:px-3 md:pr-8">
        <Message warning={true}>Reserved Type</Message>
        <GroupedTable
          headers={{ col1: "col1", col2: "col2" }}
          data={[
            {
              data: [
                {
                  col1: "row 1",
                  col2: "row 1",
                },
                {
                  col1: "row 2",
                  col2: "row 2",
                },
              ],
            },
          ]}
          responsiveCollapse={true}
        />
      </div>
    )
  }

  return (
    <Layout>
      <div className="flex absolute w-full flex-col items-center">
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
