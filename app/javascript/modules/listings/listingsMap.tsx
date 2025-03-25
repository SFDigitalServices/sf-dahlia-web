import React, { useState, useEffect, useCallback } from "react"
import { getListingsMapData } from "../../api/listingsApiService"
import type { ListingMapData } from "../../api/listingsApiService"
import { ListingsGroups } from "./DirectoryHelpers"

import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps"

interface ListingsMapProps {
  listings: ListingsGroups
}

interface MapMarkersProps {
  markers: ListingMapData[]
}

const background = (section) =>
  ({
    open: "#8BC34A",
    upcoming: "#FFEB3B",
    results: "#FF9800",
    additional: "#03A9F4",
    fcfs: "#FAFAFA",
  }[section] || "#9E9E9E")

const MapMarkers = ({ markers }: MapMarkersProps) => {
  return (
    <>
      {markers.map((marker) => (
        <AdvancedMarker key={marker.listingId} position={marker.location}>
          <Pin background={background(marker.section)} glyphColor={"#000"} borderColor={"#000"} />
        </AdvancedMarker>
      ))}
    </>
  )
}

const ListingsMap = ({ listings }: ListingsMapProps) => {
  const [listingsMapData, setListingsMapData] = useState<ListingMapData[] | undefined>(undefined)

  const mergeListingData = useCallback(
    (listingsMapsData) => {
      const listingsWithSection = [
        ...listings.open.map((listing) => ({ ...listing, section: "open" })),
        ...listings.upcoming.map((listing) => ({ ...listing, section: "upcoming" })),
        ...listings.results.map((listing) => ({ ...listing, section: "results" })),
        ...listings.additional.map((listing) => ({ ...listing, section: "additional" })),
        ...listings.fcfs.map((listing) => ({ ...listing, section: "fcfs" })),
      ]

      return listingsWithSection.map((listing) => ({
        ...listing,
        ...listingsMapsData.find((listingMapData) => listing.Id === listingMapData.listingId),
      }))
    },
    [listings]
  )

  useEffect(() => {
    getListingsMapData()
      .then((data) => {
        setListingsMapData(mergeListingData(data))
      })
      .catch((error) => {
        console.log("Error", error)
      })
  }, [mergeListingData])

  return (
    <div id="listingsMap" style={{ height: "500px" }}>
      {listingsMapData && (
        <APIProvider apiKey={process.env.GOOGLE_MAPS_API_KEY}>
          <Map
            mapId="DAHLIA_LISTINGS_MAP"
            defaultZoom={13}
            defaultCenter={{ lat: 37.783333, lng: -122.416667 }}
          >
            <MapMarkers markers={listingsMapData} />
          </Map>
        </APIProvider>
      )}
    </div>
  )
}

export default ListingsMap
