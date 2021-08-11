import React, { useEffect, useState } from "react"

import { ListingEventType, Listing } from "@bloom-housing/backend-core/types"
import {
  ActionBlock,
  Icon,
  ListingsGroup,
  ListingsList,
  LoadingOverlay,
  t,
} from "@bloom-housing/ui-components"

import { getRentalListings } from "../api/listingsApiService"
import Layout from "../layouts/Layout"
import withAppSetup from "../layouts/withAppSetup"
import Link from "../navigation/Link"

interface DirectoryProps {
  isRental: boolean
  assetPaths: unknown
}

interface ListingsGroup {
  open: Listing[]
  upcoming: Listing[]
  results: Listing[]
}

const openListingsView = (listings) =>
  listings.length > 0 ? (
    <ListingsList listings={listings} />
  ) : (
    <div className="notice-block">
      <h3 className="m-auto text-gray-800">{t("listings.noOpenListings")}</h3>
    </div>
  )

const upcomingLotteriesView = (listings) =>
  listings.length > 0 && (
    <ListingsGroup
      listings={listings}
      header={t("listings.upcomingLotteries.title")}
      hideButtonText={t("listings.upcomingLotteries.hide")}
      showButtonText={t("listings.upcomingLotteries.show")}
    />
  )

const lotteryResultsView = (listings) =>
  listings.length > 0 && (
    <ListingsGroup
      listings={listings}
      header={t("listings.lotteryResults.title")}
      hideButtonText={t("listings.lotteryResults.hide")}
      showButtonText={t("listings.lotteryResults.show")}
    />
  )

const DirectoryPage = (_props: DirectoryProps) => {
  const [listings, setListings] = useState<ListingsGroup>({ open: [], upcoming: [], results: [] })
  const [loading, setLoading] = useState<boolean>(true)
  useEffect(() => {
    void getRentalListings().then((listings) => {
      const currentDate = new Date()
      const open = []
      const upcoming = []
      const results = []
      listings.forEach((listing) => {
        if (listing.applicationDueDate > currentDate) {
          open.push(listing)
        } else {
          if (
            listing.events.some(
              (event) =>
                event.type === ListingEventType.lotteryResults &&
                event.startTime < currentDate &&
                event.endTime
            )
          ) {
            results.push(listing)
          } else {
            upcoming.push(listing)
          }
        }
      })
      setListings({ open, upcoming, results })
      setLoading(false)
    })
  }, [])

  return (
    <LoadingOverlay isLoading={loading}>
      <Layout title={t("pageTitle.rentalListings")}>
        <div>
          {!loading && (
            <>
              {openListingsView(listings.open)}
              {upcomingLotteriesView(listings.upcoming)}
              {lotteryResultsView(listings.results)}
            </>
          )}
        </div>
        <ActionBlock
          header={t("welcome.newListingEmailAlert")}
          background="primary-lighter"
          icon={<Icon size="3xl" symbol="mail" />}
          actions={[
            <Link className="button" key="action-1" href={process.env.LISTINGS_ALERT_URL}>
              {t("welcome.signUpToday")}
            </Link>,
          ]}
        />
      </Layout>
    </LoadingOverlay>
  )
}

export default withAppSetup(DirectoryPage)
