import React, { Dispatch, ReactNode, SetStateAction, useEffect, useRef, useState } from "react"
import { LoadingOverlay, StackedTableRow } from "@bloom-housing/ui-components"

import type RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"
import { EligibilityFilters } from "../../api/listingsApiService"
import {
  additionalView,
  DirectoryType,
  fcfsSalesView,
  ListingsGroups,
  lotteryResultsView,
  openListingsView,
  sortListings,
  upcomingLotteriesView,
} from "./DirectoryHelpers"
import { RailsListing } from "./SharedHelpers"
import "./ListingDirectory.scss"
import { MailingListSignup } from "../../components/MailingListSignup"
import DirectoryPageNavigationBar from "./DirectoryPageNavigationBar"

interface RentalDirectoryProps {
  listingsAPI: (filters?: EligibilityFilters) => Promise<RailsListing[]>
  directoryType: DirectoryType
  filters: EligibilityFilters
  getSummaryTable: (listing: RailsRentalListing) => Record<string, StackedTableRow>[]
  getPageHeader: (
    filters: EligibilityFilters,
    setFilters: Dispatch<SetStateAction<EligibilityFilters>>,
    match: boolean
  ) => JSX.Element
  findMoreActionBlock: ReactNode
}

export const GenericDirectory = (props: RentalDirectoryProps) => {
  const [rawListings, setRawListings] = useState<Array<RailsListing>>([])
  const [listings, setListings] = useState<ListingsGroups>({
    open: [],
    upcoming: [],
    results: [],
    additional: [],
    fcfsSalesOpen: [],
    fcfsSalesNotYetOpen: [],
  })
  const [loading, setLoading] = useState<boolean>(true)
  // Whether any listings are a match.
  const [match, setMatch] = useState<boolean>(false)
  const [filters, setFilters] = useState(props.filters ?? null)
  const [activeItem, setActiveItem] = useState(null)

  useEffect(() => {
    void props.listingsAPI(props.filters).then((listings) => {
      setLoading(true)
      setRawListings(listings)
      const sortedListings = sortListings(listings, filters, setMatch)
      setListings(sortedListings)
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props])

  useEffect(() => {
    const sortedListings = sortListings(rawListings, filters, setMatch)
    setListings(sortedListings)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const observerRef = useRef(null)
  useEffect(() => {
    const handleIntersectionEvent = (element) => {
      let newActiveItem = activeItem
      let prevY = null
      for (const e of element) {
        if (e.isIntersecting) {
          if (!prevY) {
            console.log("first if")
            prevY = e.boundingClientRect.y
            newActiveItem = e.target.id
          }

          if (e.boundingClientRect.y < prevY) {
            console.log("second if")
            newActiveItem = e.target.id
          }
        }
      }

      setActiveItem(newActiveItem)
    }

    observerRef.current = new IntersectionObserver(handleIntersectionEvent)
  }, [activeItem])

  const hasFiltersSet = filters !== null
  return (
    <LoadingOverlay isLoading={loading}>
      <div>
        {!loading && (
          <>
            {props.getPageHeader(filters, setFilters, match)}
            <DirectoryPageNavigationBar
              directoryType={props.directoryType}
              listingLengths={{
                open: listings.open.length,
                upcoming: listings.upcoming.length,
                fcfs: listings.fcfsSalesNotYetOpen.length + listings.fcfsSalesOpen.length,
                results: listings.results.length,
              }}
              activeItem={activeItem}
              setActiveItem={setActiveItem}
            />
            <div id="listing-results">
              <div
                id="enter-a-lottery"
                ref={(el) => {
                  if (el) {
                    observerRef?.current?.observe(el)
                  }
                }}
              >
                {openListingsView(
                  listings.open,
                  props.directoryType,
                  props.getSummaryTable,
                  hasFiltersSet
                )}
              </div>
              {props.directoryType === "forSale" && (
                <div
                  id="buy-now"
                  ref={(el) => {
                    if (el) {
                      observerRef?.current?.observe(el)
                    }
                  }}
                >
                  {fcfsSalesView(
                    [...listings.fcfsSalesOpen, ...listings.fcfsSalesNotYetOpen],
                    props.directoryType,
                    props.getSummaryTable,
                    hasFiltersSet
                  )}
                </div>
              )}
              {props.findMoreActionBlock}
              {filters &&
                additionalView(
                  listings.additional,
                  props.directoryType,
                  props.getSummaryTable,
                  hasFiltersSet
                )}
              <div
                id="upcoming-lotteries"
                ref={(el) => {
                  if (el) {
                    observerRef?.current?.observe(el)
                  }
                }}
              >
                {upcomingLotteriesView(
                  listings.upcoming,
                  props.directoryType,
                  props.getSummaryTable
                )}
              </div>
              <div
                id="lottery-results"
                ref={(el) => {
                  if (el) {
                    observerRef?.current?.observe(el)
                  }
                }}
              >
                {lotteryResultsView(listings.results, props.directoryType, props.getSummaryTable)}
              </div>
            </div>
          </>
        )}
        <MailingListSignup />
      </div>
    </LoadingOverlay>
  )
}

export default GenericDirectory
