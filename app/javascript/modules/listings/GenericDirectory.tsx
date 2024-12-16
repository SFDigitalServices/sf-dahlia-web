import React, { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react"
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
  return (
    <LoadingOverlay isLoading={loading}>
      <div>
        {!loading && (
          <>
            {props.getPageHeader(filters, setFilters, match)}
            <div id="listing-results">
              {openListingsView(
                listings.open,
                props.directoryType,
                props.getSummaryTable,
                hasFiltersSet
              )}
              {fcfsSalesView(
                [...listings.fcfsSalesOpen, ...listings.fcfsSalesNotYetOpen],
                props.directoryType,
                props.getSummaryTable,
                hasFiltersSet
              )}
              {props.findMoreActionBlock}
              {filters &&
                additionalView(
                  listings.additional,
                  props.directoryType,
                  props.getSummaryTable,
                  hasFiltersSet
                )}
              {upcomingLotteriesView(listings.upcoming, props.directoryType, props.getSummaryTable)}
              {lotteryResultsView(listings.results, props.directoryType, props.getSummaryTable)}
            </div>
          </>
        )}
        <MailingListSignup />
      </div>
    </LoadingOverlay>
  )
}

export default GenericDirectory
