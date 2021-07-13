import React, { useEffect, useState } from "react"

import { ListingEventType, Listing } from "@bloom-housing/backend-core/types"
import { ListingsGroup, ListingsList, LoadingOverlay, t } from "@bloom-housing/ui-components"
import Head from "next/head"

import { getRentalListings } from "../api/listingsApiService"
import Layout from "../layouts/Layout"
import withAppSetup from "../layouts/withAppSetup"

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
    // todo: remove this. it's just for display purposes
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
      <Layout>
        <Head>
          <title>{t("t.dahliaSanFranciscoHousingPortal")}</title>
        </Head>
        <div>
          {!loading && (
            <>
              {openListingsView(listings.open)}
              {upcomingLotteriesView(listings.upcoming)}
              {lotteryResultsView(listings.results)}
            </>
          )}
        </div>
      </Layout>
    </LoadingOverlay>
  )
}

export default withAppSetup(DirectoryPage)
