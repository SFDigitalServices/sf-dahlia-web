import React, {
  useRef,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react"
import { LoadingOverlay, StackedTableRow, t } from "@bloom-housing/ui-components"

import type RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"
import { EligibilityFilters } from "../../api/listingsApiService"
import {
  additionalView,
  DirectoryType,
  FcfsSalesView,
  ListingsGroups,
  lotteryResultsView,
  matchedTextBanner,
  noMatchesTextBanner,
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
  DIRECTORY_SECTION_ADDITIONAL_LISTINGS,
  DIRECTORY_SECTION_LOTTERY_RESULTS,
  DIRECTORY_SECTION_UPCOMING_LOTTERIES,
} from "../constants"
import { MenuIntersectionObserverHandle, MenuIntersectionObserver } from "./util/NavigationBarUtils"
import { ConfigContext } from "../../lib/ConfigContext"

interface RentalDirectoryProps {
  listingsAPI: (filters?: EligibilityFilters) => Promise<RailsListing[]>
  directoryType: DirectoryType
  filters: EligibilityFilters
  getSummaryTable: (listing: RailsRentalListing) => Record<string, StackedTableRow>[]
  getPageHeader: (
    filters: EligibilityFilters,
    setFilters: Dispatch<SetStateAction<EligibilityFilters>>,
    addObservedElement: (elem: HTMLElement) => void
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
    fcfs: [],
  })
  const [loading, setLoading] = useState<boolean>(true)
  // Whether any listings are a match.
  const [match, setMatch] = useState<boolean>(false)
  const [filters, setFilters] = useState(props.filters ?? null)
  const [activeItem, setActiveItem] = useState<string>(null)
  const [resultsIsOpen, setResultsIsOpen] = useState<boolean>(false)
  const [upcomingIsOpen, setUpcomingIsOpen] = useState<boolean>(false)
  const [additionalIsOpen, setAdditionalIsOpen] = useState<boolean>(false)
  const menuIntersectionObserverRef = useRef<MenuIntersectionObserverHandle>(null)

  const addObservedElement = (elem) => {
    menuIntersectionObserverRef.current?.addObservedElement(elem)
  }

  const handleNavigation = (section: string) => {
    setActiveItem(section)

    switch (section) {
      case DIRECTORY_SECTION_ADDITIONAL_LISTINGS:
        setAdditionalIsOpen(true)
        break
      case DIRECTORY_SECTION_LOTTERY_RESULTS:
        setResultsIsOpen(true)
        break
      case DIRECTORY_SECTION_UPCOMING_LOTTERIES:
        setUpcomingIsOpen(true)
        break
    }
  }

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

  useEffect(() => {
    if (!loading) {
      const hash = window.location.hash
      if (hash) {
        window.location.href = hash
      }
    }
  }, [loading])

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

  const { getAssetPath } = useContext(ConfigContext)

  return (
    <LoadingOverlay isLoading={loading}>
      <MenuIntersectionObserver ref={menuIntersectionObserverRef} setActiveItem={setActiveItem} />
      <div>
        {!loading && (
          <>
            {props.getPageHeader(filters, setFilters, addObservedElement)}
            <DirectoryPageNavigationBar
              directorySectionInfo={directorySectionInfo}
              activeItem={activeItem}
              listings={listings}
              handleNavigation={handleNavigation}
            />
            <div className="match-banner">
              {filters &&
                (match
                  ? matchedTextBanner()
                  : noMatchesTextBanner(
                      `${t("listings.eligibilityCalculator.rent.noMatchingUnits")}`
                    ))}
            </div>
            <div id="listing-results">
              {openListingsView(
                listings.open,
                props.directoryType,
                props.getSummaryTable,
                addObservedElement,
                hasFiltersSet,
                listings.fcfs.length,
                getAssetPath("house-circle-check.svg")
              )}
              {props.directoryType === DIRECTORY_TYPE_SALES &&
                FcfsSalesView(
                  listings.fcfs,
                  props.directoryType,
                  props.getSummaryTable,
                  addObservedElement,
                  hasFiltersSet,
                  listings.open.length,
                  getAssetPath("house-circle-check.svg")
                )}
              {props.findMoreActionBlock}
              {filters &&
                additionalView(
                  listings.additional,
                  props.directoryType,
                  props.getSummaryTable,
                  addObservedElement,
                  hasFiltersSet,
                  additionalIsOpen,
                  setAdditionalIsOpen
                )}
              {upcomingLotteriesView(
                listings.upcoming,
                props.directoryType,
                props.getSummaryTable,
                addObservedElement,
                upcomingIsOpen,
                setUpcomingIsOpen
              )}
              {lotteryResultsView(
                listings.results,
                props.directoryType,
                props.getSummaryTable,
                addObservedElement,
                resultsIsOpen,
                setResultsIsOpen
              )}
            </div>
          </>
        )}
        <MailingListSignup />
      </div>
    </LoadingOverlay>
  )
}

export default GenericDirectory
