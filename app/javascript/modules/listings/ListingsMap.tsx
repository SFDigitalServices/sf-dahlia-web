import React, { useState, useEffect } from "react"
import { getListingsMapData } from "../../api/listingsApiService"
import type { ListingMapData } from "../../api/listingsApiService"
import type { ListingsGroups } from "./DirectoryHelpers"
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps"
import { ListingAddress } from "../../components/ListingAddress"
import { getImageCardProps, RailsListing } from "./SharedHelpers"
import { DIRECTORY_SECTION_INFO } from "../constants"
import "./ListingsMap.scss"

import { Icon } from "@bloom-housing/ui-components"
import { Link } from "@bloom-housing/ui-seeds"

type MergedListingMapData = ListingMapData & RailsListing
interface ListingsMapProps {
  listings: ListingsGroups
  sectionRef: string
  mobileView: boolean
}
interface MapMarkerProps {
  marker: MergedListingMapData
  selectMarker: (listingId: string) => void
  deselectMarkers: () => void
  mobileView: boolean
}

interface MobileExpandedPinProps {
  marker: MergedListingMapData
  deselectMarkers: () => void
}

const pinStyle = (sectionRef) =>
  ({
    "enter-a-lottery": {
      bg: "#8BC34A",
      iconSymbol: DIRECTORY_SECTION_INFO.open.icon,
    },
    "upcoming-lotteries": {
      bg: "#FFEB3B",
      iconSymbol: DIRECTORY_SECTION_INFO.upcoming.icon,
    },
    "lottery-results": {
      bg: "#FF9800",
      iconSymbol: DIRECTORY_SECTION_INFO.results.icon,
    },
    "additional-listings": {
      bg: "#03A9F4",
      iconSymbol: DIRECTORY_SECTION_INFO.additional.icon,
    },
    "buy-now": {
      // fcfs
      bg: "#FAFAFA",
      iconSymbol: "house",
    },
  }[sectionRef] || {
    bg: "#9E9E9E",
    iconSymbol: "house",
  })

// TODO combine listings with identical lat/lng so they don't cover one another on the map
const mergeListingData = (
  listingsMapsData: ListingMapData[],
  groupedListings: ListingsGroups
): MergedListingMapData[] => {
  const listingsWithSection = [
    ...groupedListings.open.map((listing) => ({
      ...listing,
      section: DIRECTORY_SECTION_INFO.open,
    })),
    ...groupedListings.upcoming.map((listing) => ({
      ...listing,
      section: DIRECTORY_SECTION_INFO.upcoming,
    })),
    ...groupedListings.results.map((listing) => ({
      ...listing,
      section: DIRECTORY_SECTION_INFO.results,
    })),
    ...groupedListings.additional.map((listing) => ({
      ...listing,
      section: DIRECTORY_SECTION_INFO.additional,
    })),
    ...groupedListings.fcfs.map((listing) => ({
      ...listing,
      section: DIRECTORY_SECTION_INFO.fcfs,
    })),
  ]

  // only show listings in the current directory (provided by props)
  return listingsWithSection.map((listing) => ({
    ...listing,
    ...listingsMapsData.find((listingMapData) => listing.Id === listingMapData.listingId),
    selected: false,
    hidden: listing.section.ref !== "enter-a-lottery",
  }))
}

const MapMarker = ({ marker, mobileView, selectMarker, deselectMarkers }: MapMarkerProps) => {
  const { bg, iconSymbol } = pinStyle(marker.section.ref)

  const Pin = () => (
    <div className="map-marker" style={{ backgroundColor: marker.selected ? "#2196F3" : bg }}>
      <Icon size="large" symbol={iconSymbol} />
    </div>
  )

  const ExpandedPin = () => {
    const { imageUrl, description } = getImageCardProps(marker)

    return (
      <div
        className="map-marker-expanded"
        style={{
          border: `solid 0.2rem ${bg}`,
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "row",
          padding: "1.5rem",
        }}
      >
        <div style={{ width: "40%" }}>
          <img src={imageUrl} alt={description} style={{ width: "100%" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>
            <Link href={`/listings/${marker.listingID}`} newWindowTarget>
              {marker.Name}
            </Link>
          </div>
          <div>
            <ListingAddress listing={marker} cityNewline />
          </div>
        </div>
      </div>
    )
  }

  if (marker.hidden) return null

  return (
    <AdvancedMarker
      key={marker.listingId}
      position={marker.location}
      onClick={() => selectMarker(marker.listingId)}
      zIndex={marker.selected ? 1 : 0}
    >
      {marker.selected && !mobileView && <ExpandedPin />}
      {(!marker.selected || mobileView) && <Pin />}
    </AdvancedMarker>
  )
}

const MobileExpandedPin = ({ marker, deselectMarkers }: MobileExpandedPinProps) => {
  const { imageUrl, description } = getImageCardProps(marker)

  return (
    <div
      className="map-marker-expanded"
      style={{
        border: `solid 0.2rem #000`,
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "row",
        padding: "1rem",
        position: "fixed",
        width: "80vw",
        bottom: "10rem",
        left: "10vw",
        zIndex: 10,
      }}
      onClick={() => deselectMarkers()}
    >
      <div style={{ width: "40%" }}>
        <img src={imageUrl} alt={description} style={{ width: "100%" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div>
          <Link href={`/listings/${marker.listingID}`} newWindowTarget>
            {marker.Name}
          </Link>
        </div>
        <div>
          <ListingAddress listing={marker} cityNewline />
        </div>
        <div>
          <p>{marker.unitSummaries.general[0].unitType}</p>
          <p>${marker.unitSummaries.general[0].maxPriceWithoutParking}</p>
        </div>
      </div>
    </div>
  )
}

const ListingsMap = ({ listings, sectionRef, mobileView }: ListingsMapProps) => {
  const [listingsMapData, setListingsMapData] = useState<MergedListingMapData[]>([])

  useEffect(() => {
    getListingsMapData()
      .then((data) => {
        setListingsMapData(mergeListingData(data, listings))
      })
      .catch((error) => {
        console.log("Error", error)
      })
  }, [listings])

  useEffect(() => {
    setListingsMapData((l) =>
      l.map((data) => ({
        ...data,
        hidden: data.section.ref !== sectionRef,
      }))
    )
  }, [sectionRef])

  const selectMarker = (listingId: string) => {
    setListingsMapData((l) =>
      l.map((data) => ({
        ...data,
        selected: data.listingID === listingId && !data.selected,
      }))
    )
  }

  const deselectMarkers = () =>
    setListingsMapData((l) =>
      l.map((data) => ({
        ...data,
        selected: false,
      }))
    )

  const selectedMarker = () => listingsMapData.find((data) => data.selected)

  return (
    <div id="listingsMap" style={{ height: "100%" }}>
      {listingsMapData.length > 0 && (
        <APIProvider apiKey={process.env.GOOGLE_MAPS_API_KEY}>
          <Map
            mapId="DAHLIA_LISTINGS_MAP"
            defaultZoom={13}
            defaultCenter={{ lat: 37.783333, lng: -122.416667 }}
          >
            {listingsMapData.map((marker) => (
              <MapMarker
                marker={marker}
                selectMarker={selectMarker}
                deselectMarkers={deselectMarkers}
                key={marker.listingID}
                mobileView={mobileView}
              />
            ))}
          </Map>
        </APIProvider>
      )}
      {mobileView && selectedMarker() && (
        <MobileExpandedPin marker={selectedMarker()} deselectMarkers={deselectMarkers} />
      )}
    </div>
  )
}

export default ListingsMap
