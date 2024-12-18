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
  DIRECTORY_SECTION_INFO,
  DIRECTORY_TYPE_SALES,
  RENTAL_DIRECTORY_SECTIONS,
  SALE_DIRECTORY_SECTIONS,
} from "../constants"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"

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

const DirectorySection = ({
  refKey,
  observerRef,
  children,
}: {
  refKey: string
  observerRef: React.MutableRefObject<null | IntersectionObserver>
  children: ReactNode
}) => {
  return (
    <div
      id={refKey}
      ref={(el) => {
        if (el) {
          observerRef?.current?.observe(el)
        }
      }}
    >
      {children}
    </div>
  )
}

export const GenericDirectory = (props: RentalDirectoryProps) => {
  const [rawListings, setRawListings] = useState<Array<RailsListing>>([])
  const [listings, setListings] = useState<ListingsGroups>({
    open: [],
    upcoming: [],
    results: [],
    additional: [],
    fcfs: [],
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

  const { unleashFlag: newDirectoryEnabled } = useFeatureFlag(
    "temp.webapp.directory.listings",
    false
  )

  return (
    <LoadingOverlay isLoading={loading}>
      <div>
        {!loading && (
          <>
            {props.getPageHeader(filters, setFilters, match)}
            {newDirectoryEnabled && (
              <DirectoryPageNavigationBar
                directorySections={directorySections.map((section: string) => {
                  return { key: section, ...DIRECTORY_SECTION_INFO[section] }
                })}
                activeItem={activeItem}
                listings={listings}
              />
            )}
            <div id="listing-results">
              <DirectorySection refKey="enter-a-lottery" observerRef={observerRef}>
                {openListingsView(
                  listings.open,
                  props.directoryType,
                  props.getSummaryTable,
                  hasFiltersSet
                )}
              </DirectorySection>
              {props.directoryType === DIRECTORY_TYPE_SALES && (
                <DirectorySection refKey="buy-now" observerRef={observerRef}>
                  {fcfsSalesView(
                    listings.fcfs,
                    props.directoryType,
                    props.getSummaryTable,
                    hasFiltersSet
                  )}
                </DirectorySection>
              )}
              {props.findMoreActionBlock}
              {filters &&
                additionalView(
                  listings.additional,
                  props.directoryType,
                  props.getSummaryTable,
                  hasFiltersSet
                )}
              <DirectorySection refKey="upcoming-lotteries" observerRef={observerRef}>
                {upcomingLotteriesView(
                  listings.upcoming,
                  props.directoryType,
                  props.getSummaryTable
                )}
              </DirectorySection>
              <DirectorySection refKey="lottery-results" observerRef={observerRef}>
                {lotteryResultsView(listings.results, props.directoryType, props.getSummaryTable)}
              </DirectorySection>
            </div>
          </>
        )}
        <MailingListSignup />
      </div>
    </LoadingOverlay>
  )
}

export default GenericDirectory
