import React, {
  Dispatch,
  MutableRefObject,
  ReactNode,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react"
import { LoadingOverlay, StackedTableRow, t } from "@bloom-housing/ui-components"

import type RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"
import { EligibilityFilters } from "../../api/listingsApiService"
import {
  additionalView,
  DirectoryType,
  fcfsSalesView,
  handleSectionHeaderEvents,
  ListingsGroups,
  lotteryResultsView,
  matchedTextBanner,
  noMatchesTextBanner,
  openListingsView,
  sortListings,
  toggleNavBarBoxShadow,
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
  DIRECTORY_SECTION_ADDITIONAL_LISTINGS,
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
    observerRef: React.MutableRefObject<null | IntersectionObserver>
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
  const [activeItem, setActiveItem] = useState<string>(null)

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
  const directorySections =
    props.directoryType === DIRECTORY_TYPE_SALES
      ? SALE_DIRECTORY_SECTIONS
      : RENTAL_DIRECTORY_SECTIONS

  const directorySectionInfo = directorySections.map((section: string) => {
    return { key: section, ...DIRECTORY_SECTION_INFO[section] }
  })
  if (hasFiltersSet && listings.additional.length > 0) {
    directorySectionInfo.splice(-2, 0, {
      key: DIRECTORY_SECTION_ADDITIONAL_LISTINGS,
      ...DIRECTORY_SECTION_INFO[DIRECTORY_SECTION_ADDITIONAL_LISTINGS],
    })
  }

  const observerRef: MutableRefObject<null | IntersectionObserver> = useRef(null)
  useEffect(() => {
    const handleIntersectionEvents = (events: IntersectionObserverEntry[]) => {
      toggleNavBarBoxShadow(events)

      handleSectionHeaderEvents(events, setActiveItem)
    }

    observerRef.current = new IntersectionObserver(handleIntersectionEvents)
  }, [activeItem])

  const { unleashFlag: newDirectoryEnabled } = useFeatureFlag(
    "temp.webapp.directory.listings",
    false
  )

  return (
    <LoadingOverlay isLoading={loading}>
      <div>
        {!loading && (
          <>
            {props.getPageHeader(filters, setFilters, observerRef)}
            {newDirectoryEnabled && (
              <DirectoryPageNavigationBar
                directorySectionInfo={directorySectionInfo}
                activeItem={activeItem}
                listings={listings}
              />
            )}
            <div className="match-banner">
              {filters &&
                (match
                  ? matchedTextBanner()
                  : noMatchesTextBanner(
                      `${t("listings.eligibilityCalculator.rent.noMatchingUnits")}`
                    ))}
            </div>
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
              <DirectorySection refKey="additional-listings" observerRef={observerRef}>
                {filters &&
                  additionalView(
                    listings.additional,
                    props.directoryType,
                    props.getSummaryTable,
                    hasFiltersSet
                  )}
              </DirectorySection>
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
