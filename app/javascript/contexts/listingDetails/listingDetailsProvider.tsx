import React, { useReducer } from "react"
import ListingDetailsReducer from "./listingDetailsReducer"
import ListingDetailsContext, { ContextProps } from "./listingDetailsContext"
import { getUnits, getAmiCharts } from "../../api/listingApiService"
import { RailsUnit } from "../../api/types/rails/listings/RailsUnit"
import { RailsAmiChart, RailsAmiChartMetaData } from "../../api/types/rails/listings/RailsAmiChart"
import {
  finishFetchingUnits,
  finishFetchingAmiCharts,
  startFetchingAmiCharts,
  startFetchingUnits,
  setFetchingAmiChartsError,
  setFetchingUnitsError,
} from "./listingDetailsActions"

interface ListingDetailsProviderProps {
  children?: React.ReactNode
}

const ListingDetailsProvider = (props: ListingDetailsProviderProps) => {
  const [state, dispatch] = useReducer(ListingDetailsReducer, {
    units: [],
    amiCharts: [],
    fetchingUnits: false,
    fetchedUnits: false,
    fetchingAmiCharts: false,
    fetchedAmiCharts: false,
    fetchingAmiChartsError: null,
    fetchingUnitsError: null,
  })

  const contextValues: ContextProps = {
    units: state.units,
    amiCharts: state.amiCharts,
    fetchedAmiCharts: state.fetchedAmiCharts,
    fetchingAmiCharts: state.fetchingAmiCharts,
    fetchedUnits: state.fetchedUnits,
    fetchingUnits: state.fetchingUnits,
    fetchingAmiChartsError: state.fetchingAmiChartsError,
    fetchingUnitsError: state.fetchingUnitsError,
    fetchUnits: (listingId: string) => {
      dispatch(startFetchingUnits())
      getUnits(listingId)
        .then((units: RailsUnit[]) => {
          dispatch(finishFetchingUnits(units))
        })
        .catch((error) => {
          console.error(error)
          dispatch(setFetchingUnitsError(error))
        })
    },
    fetchAmiCharts: (chartsToFetch: RailsAmiChartMetaData[]) => {
      dispatch(startFetchingAmiCharts())
      getAmiCharts(chartsToFetch)
        .then((amiCharts: RailsAmiChart[]) => {
          dispatch(finishFetchingAmiCharts(amiCharts))
        })
        .catch((error) => {
          console.error(error)
          dispatch(setFetchingAmiChartsError(error))
        })
    },
  }

  return (
    <ListingDetailsContext.Provider value={contextValues}>
      {props.children}
    </ListingDetailsContext.Provider>
  )
}

export default ListingDetailsProvider
