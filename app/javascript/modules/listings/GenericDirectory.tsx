import React, {
  Dispatch,
  MutableRefObject,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
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
  DIRECTORY_PAGE_HEADER,
  DIRECTORY_SECTION_LOTTERY_RESULTS,
  DIRECTORY_SECTION_UPCOMING_LOTTERIES,
} from "../constants"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { handleSectionHeaderEntries, toggleNavBarBoxShadow } from "./util/NavigationBarUtils"
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

interface ObservedElementsProps {
  [key: string]: Element
}

interface ElementHeightsProps {
  [key: string]: number
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
  const currentElement: MutableRefObject<null | Element> = useRef(null)
  const ratio: number = 0.6
  const docRef = useRef(document)
  const lastScrollY = useRef<number>(0)
  const scrollDirection = useRef<number>(1)
  const intersectionObservers = useRef<IntersectionObserver[]>([])
  const observedElements = useRef<ObservedElementsProps>({})
  const elementHeights = useRef<ElementHeightsProps>({})
  const resizeObserverRef: MutableRefObject<null | ResizeObserver> = useRef(null)

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

  const handleIntersectionEntries = (entries: IntersectionObserverEntry[]) => {
    const pageHeaderEntries = entries.filter((e) => e.target.id === DIRECTORY_PAGE_HEADER)
    toggleNavBarBoxShadow(pageHeaderEntries)

    const sectionHeaderEntries = entries.filter(
      (e) => e.target.id !== DIRECTORY_PAGE_HEADER && e.isIntersecting
    )
    const newActiveItem: string = handleSectionHeaderEntries(
      sectionHeaderEntries,
      currentElement.current,
      scrollDirection
    )
    if (newActiveItem) {
      setActiveItem(newActiveItem)
    }
  }

  const addIntersectionObserver = useCallback((element: Element) => {
    // create a different threshold and observer for each element, since they may have very different heights
    const threshold = Math.min(1, (window.innerHeight / element.clientHeight) * ratio)
    const observer = new IntersectionObserver(handleIntersectionEntries, { threshold })
    observer.observe(element)

    intersectionObservers.current.push(observer)
    elementHeights[element.id] = element.clientHeight
    if (resizeObserverRef.current) {
      resizeObserverRef.current.observe(element)
    }
  }, [])

  const initObservers = useCallback(() => {
    intersectionObservers.current.forEach((observer) => observer.disconnect())
    intersectionObservers.current = []
    resizeObserverRef.current.disconnect()

    for (const element of Object.values(observedElements.current)) {
      addIntersectionObserver(element)
    }
  }, [addIntersectionObserver])

  const addObservedElement = useCallback(
    (elem: Element): void => {
      if (elem && !(elem.id in observedElements)) {
        observedElements.current[elem.id] = elem
        addIntersectionObserver(elem)
      }
    },
    [addIntersectionObserver]
  )

  const { unleashFlag: humanTranslationsReady } = useFeatureFlag(
    "temp.webapp.listings.sales.fcfsListings.subtitle",
    false
  )

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

  const { unleashFlag: newDirectoryEnabled } = useFeatureFlag(
    "temp.webapp.directory.listings",
    false
  )

  useEffect(() => {
    if (newDirectoryEnabled) {
      const handleResize = (entries) => {
        window.requestAnimationFrame((): void | undefined => {
          for (const entry of entries) {
            const currentHeight = elementHeights[entry.target.id]
            const diff = Math.abs(entry.contentRect.height - currentHeight) / currentHeight

            if (diff > 0.02) {
              // the resized difference is big enough that we should reset the intersection ratios
              initObservers()

              return
            }
          }
        })
      }

      docRef.current.addEventListener("scroll", () => {
        scrollDirection.current = window.scrollY > lastScrollY.current ? 1 : -1
        lastScrollY.current = window.scrollY
      })
      if (!resizeObserverRef.current) {
        resizeObserverRef.current = new ResizeObserver(handleResize)
      }
      initObservers()
    }
  }, [newDirectoryEnabled, initObservers])

  const { getAssetPath } = useContext(ConfigContext)

  return (
    <LoadingOverlay isLoading={loading}>
      <div>
        {!loading && (
          <>
            {props.getPageHeader(filters, setFilters, addObservedElement)}
            {newDirectoryEnabled && (
              <DirectoryPageNavigationBar
                directorySectionInfo={directorySectionInfo}
                activeItem={activeItem}
                listings={listings}
                handleNavigation={handleNavigation}
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
                  humanTranslationsReady,
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
                  setAdditionalIsOpen,
                  newDirectoryEnabled
                )}
              {upcomingLotteriesView(
                listings.upcoming,
                props.directoryType,
                props.getSummaryTable,
                addObservedElement,
                upcomingIsOpen,
                setUpcomingIsOpen,
                newDirectoryEnabled
              )}
              {lotteryResultsView(
                listings.results,
                props.directoryType,
                props.getSummaryTable,
                addObservedElement,
                resultsIsOpen,
                setResultsIsOpen,
                newDirectoryEnabled
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
