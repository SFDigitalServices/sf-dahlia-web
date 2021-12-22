import React, { useContext, useEffect, useState, Dispatch, SetStateAction } from "react"
import { LoadingOverlay, StackedTableRow } from "@bloom-housing/ui-components"

import RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"
import { ConfigContext } from "../../lib/ConfigContext"
import { EligibilityFilters } from "../../api/listingsApiService"
import {
  RailsListing,
  DirectoryType,
  ListingsGroups,
  openListingsView,
  upcomingLotteriesView,
  lotteryResultsView,
  additionalView,
  signUpActionBlock,
  sortListings,
  housingCounselorActionBlock,
} from "./DirectoryHelpers"
import "./ListingDirectory.scss"

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
  findMoreActionBlock: (filters: EligibilityFilters, match: boolean) => JSX.Element
}

export const GenericDirectory = (props: RentalDirectoryProps) => {
  const { listingsAlertUrl } = useContext(ConfigContext)
  const [listings, setListings] = useState<ListingsGroups>({
    open: [],
    upcoming: [],
    results: [],
    additional: [],
  })
  const [loading, setLoading] = useState<boolean>(true)
  // Whether any listings are a match.
  const [match, setMatch] = useState<boolean>(false)
  const [filters, setFilters] = useState(props.filters ?? null)

  useEffect(() => {
    void props.listingsAPI(props.filters).then((listings) => {
      setLoading(true)
      const sortedListings = sortListings(listings, filters, setMatch)
      setListings(sortedListings)
      setLoading(false)
    })
  }, [props, filters])

  const hasFiltersSet = filters !== null
  return (
    <LoadingOverlay isLoading={loading}>
      <div>
        <div>
          {!loading && (
            <>
              {props.getPageHeader(filters, setFilters, match)}
              {openListingsView(
                listings.open,
                props.directoryType,
                props.getSummaryTable,
                hasFiltersSet
              )}

              {props.findMoreActionBlock(filters, match)}

              {filters && housingCounselorActionBlock()}
              {filters &&
                additionalView(
                  listings.additional,
                  props.directoryType,
                  props.getSummaryTable,
                  hasFiltersSet
                )}
              {upcomingLotteriesView(listings.upcoming, props.directoryType, props.getSummaryTable)}
              {lotteryResultsView(listings.results, props.directoryType, props.getSummaryTable)}
            </>
          )}
        </div>
        {signUpActionBlock(listingsAlertUrl)}
      </div>
    </LoadingOverlay>
  )
}

export default GenericDirectory
