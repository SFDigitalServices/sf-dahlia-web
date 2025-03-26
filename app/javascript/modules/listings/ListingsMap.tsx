import React, { useState, useEffect } from "react"
import { getListingsMapData } from "../../api/listingsApiService"
import type { ListingMapData } from "../../api/listingsApiService"
import { ListingsGroups } from "./DirectoryHelpers"
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps"
import { ListingAddress } from "../../components/ListingAddress"
import { getListingAddressString } from "../../util/listingUtil"
import { RailsListing } from "./SharedHelpers"
import "./ListingsMap.scss"

import { Icon } from "@bloom-housing/ui-components"
import { CheckboxGroup, Link } from "@bloom-housing/ui-seeds"

type MergedListingMapData = ListingMapData & RailsListing
interface ListingsMapProps {
  listings: ListingsGroups
}
interface MapMarkerProps {
  marker: MergedListingMapData
  onClick: (listingId: string) => void
}

const pinStyle = (section) =>
  ({
    open: {
      bg: "#8BC34A",
      iconSymbol: "house",
    },
    upcoming: {
      bg: "#FFEB3B",
      iconSymbol: "clock",
    },
    results: {
      bg: "#FF9800",
      iconSymbol: "result",
    },
    additional: {
      bg: "#03A9F4",
      iconSymbol: "doubleHouse",
    },
    fcfs: {
      bg: "#FAFAFA",
      iconSymbol: "house",
    },
  }[section] || {
    bg: "#9E9E9E",
    iconSymbol: "house",
  })

const propertInfoLink = (listing: RailsListing) =>
  `https://sfplanninggis.org/PIM/?search=${getListingAddressString(listing)}`

// TODO combine listings with identical lat/lng so they don't cover one another on the map
const mergeListingData = (
  listingsMapsData: ListingMapData[],
  groupedListings: ListingsGroups
): MergedListingMapData[] => {
  const listingsWithSection = [
    ...groupedListings.open.map((listing) => ({ ...listing, section: "open" })),
    ...groupedListings.upcoming.map((listing) => ({ ...listing, section: "upcoming" })),
    ...groupedListings.results.map((listing) => ({ ...listing, section: "results" })),
    ...groupedListings.additional.map((listing) => ({ ...listing, section: "additional" })),
    ...groupedListings.fcfs.map((listing) => ({ ...listing, section: "fcfs" })),
  ]

  // only show listings in the current directory (provided by props)
  return listingsWithSection.map((listing) => ({
    ...listing,
    ...listingsMapsData.find((listingMapData) => listing.Id === listingMapData.listingId),
    selected: false,
    hidden: listing.section !== "open",
  }))
}

const MapMarker = ({ marker, onClick }: MapMarkerProps) => {
  const { bg, iconSymbol } = pinStyle(marker.section)

  const Pin = () => (
    <div className="map-marker" style={{ backgroundColor: bg }}>
      <Icon size="large" symbol={iconSymbol} />
    </div>
  )

  const ExpandedPin = () => (
    <div
      className="map-marker-expanded"
      style={{ border: `solid 0.2rem ${bg}`, backgroundColor: "#fff" }}
    >
      <Link href={`/listings/${marker.listingID}`} newWindowTarget>
        {marker.Name}
      </Link>
      <Link href={propertInfoLink(marker)} newWindowTarget>
        Property Information
      </Link>
      <ListingAddress listing={marker} />
    </div>
  )

  if (marker.hidden) return null

  return (
    <AdvancedMarker
      key={marker.listingId}
      position={marker.location}
      onClick={() => onClick(marker.listingId)}
      zIndex={marker.selected ? 1 : 0}
    >
      {marker.selected ? <ExpandedPin /> : <Pin />}
    </AdvancedMarker>
  )
}

const ListingsMap = ({ listings }: ListingsMapProps) => {
  const [listingsMapData, setListingsMapData] = useState<MergedListingMapData[] | undefined>(
    undefined
  )

  const [markerFilters, setMarkerFilters] = useState([
    {
      label: "Open",
      value: "open",
      selected: true,
    },
    {
      label: "Upcoming",
      value: "upcoming",
      selected: false,
    },
    {
      label: "Results",
      value: "results",
      selected: false,
    },
    {
      label: "Additional",
      value: "additional",
      selected: false,
    },
    {
      label: "FCFS",
      value: "fcfs",
      selected: false,
    },
  ])

  useEffect(() => {
    getListingsMapData()
      .then((data) => {
        setListingsMapData(mergeListingData(data, listings))
      })
      .catch((error) => {
        console.log("Error", error)
      })
  }, [listings])

  const handleClickMarker = (listingId: string) =>
    setListingsMapData(
      listingsMapData.map((data) => ({
        ...data,
        selected: data.listingID === listingId && !data.selected,
      }))
    )

  const handleClickFilter = (selectedFilters) => {
    setMarkerFilters(
      markerFilters.map((filter) => ({
        ...filter,
        selected: selectedFilters
          .map((selectedFilter) => selectedFilter.value)
          .includes(filter.value),
      }))
    )
    setListingsMapData(
      listingsMapData.map((data) => ({
        ...data,
        hidden: !selectedFilters
          .map((selectedFilter) => selectedFilter.value)
          .includes(data.section),
      }))
    )
  }

  return (
    <div id="listingsMap" style={{ height: "500px" }}>
      <CheckboxGroup
        id="map-marker-filter"
        values={markerFilters.filter((filter) => filter.selected)}
        options={markerFilters}
        onChange={handleClickFilter}
      />
      {listingsMapData && (
        <APIProvider apiKey={process.env.GOOGLE_MAPS_API_KEY}>
          <Map
            mapId="DAHLIA_LISTINGS_MAP"
            defaultZoom={13}
            defaultCenter={{ lat: 37.783333, lng: -122.416667 }}
          >
            {listingsMapData.map((marker) => (
              <MapMarker marker={marker} onClick={handleClickMarker} key={marker.listingID} />
            ))}
          </Map>
        </APIProvider>
      )}
    </div>
  )
}

export default ListingsMap
