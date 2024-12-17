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
import {
  DIRECTORY_TYPE_SALES,
  RENTAL_DIRECTORY_SECTIONS,
  SALE_DIRECTORY_SECTIONS,
} from "../constants"
import { IconHomeCheck } from "./assets/icon-home-check"

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

  const hasFiltersSet = filters !== null

  const observerRef = useRef(null)
  useEffect(() => {
    const handleIntersectionEvents = (events: IntersectionObserverEntry[]) => {
      let newActiveItem = activeItem
      for (const e of events) {
        let prevRatio = null
        if (e.isIntersecting) {
          if (!prevRatio) {
            prevRatio = e.intersectionRatio
            newActiveItem = e.target.id
          } else if (e.intersectionRatio > prevRatio) {
            newActiveItem = e.target.id
          }
        }
      }

      setActiveItem(newActiveItem)
    }

    observerRef.current = new IntersectionObserver(handleIntersectionEvents)
  }, [activeItem])

  const directorySections =
    props.directoryType === DIRECTORY_TYPE_SALES
      ? SALE_DIRECTORY_SECTIONS
      : RENTAL_DIRECTORY_SECTIONS

  const directorySectionInfo = {
    open: {
      ref: "enter-a-lottery",
      icon: "house",
      numListings: listings.open.length,
    },
    fcfs: {
      ref: "buy-now",
      icon: IconHomeCheck,
      numListings: listings.fcfsSalesNotYetOpen.length + listings.fcfsSalesOpen.length,
    },
    upcoming: {
      ref: "upcoming-lotteries",
      icon: "clock",
      numListings: listings.upcoming.length,
    },
    results: {
      ref: "lottery-results",
      icon: "result",
      numListings: listings.results.length,
    },
  }

  return (
    <LoadingOverlay isLoading={loading}>
      <div>
        {!loading && (
          <>
            {props.getPageHeader(filters, setFilters, match)}
            <DirectoryPageNavigationBar
              directorySections={directorySections.map((section: string) => {
                return { key: section, ...directorySectionInfo[section] }
              })}
              activeItem={activeItem}
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
              {props.directoryType === DIRECTORY_TYPE_SALES && (
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
