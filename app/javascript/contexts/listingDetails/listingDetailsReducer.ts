import { createReducer } from "typesafe-actions"
import { ListingDetailsActions } from "./listingDetailsActions"
import RailsUnit from "../../api/types/rails/listings/RailsUnit"
import { RailsAmiChart, RailsAmiChartMetaData } from "../../api/types/rails/listings/RailsAmiChart"

type ListingDetailsState = {
  fetchingUnits: boolean
  fetchedUnits: boolean
  fetchingAmiCharts: boolean
  fetchedAmiCharts: boolean
  units: RailsUnit[]
  amiCharts: RailsAmiChart[]
  fetchingAmiChartsError: Error
  fetchingUnitsError: Error
}

const ListingDetailsReducer = createReducer({ units: [] } as ListingDetailsState, {
  [ListingDetailsActions.StartFetchingUnits]: (state) => {
    return { ...state, fetchingUnits: true }
  },
  [ListingDetailsActions.StartFetchingAmiCharts]: (state) => {
    return { ...state, fetchingAmiCharts: true }
  },
  [ListingDetailsActions.FinishFetchingUnits]: (state, { payload: units }) => {
    return {
      ...state,
      fetchingUnits: false,
      fetchedUnits: true,
      units,
    }
  },
  [ListingDetailsActions.FinishFetchingAmiCharts]: (
    state,
    { payload: { amiCharts, chartsToFetch } }
  ) => {
    return {
      ...state,
      fetchingAmiCharts: false,
      fetchedAmiCharts: true,
      amiCharts: amiCharts?.map((amiChart: RailsAmiChart) => {
        return {
          ...amiChart,
          /*
           * The chartType are the same on all the values
           */
          chartType: amiChart?.values[0]?.chartType,
          year: amiChart?.values[0]?.year,
          derivedFrom: chartsToFetch.find((chart: RailsAmiChartMetaData) => {
            return chart.percent === Number(amiChart.percent)
          })?.derivedFrom,
        }
      }),
    }
  },
  [ListingDetailsActions.SetFetchingAmiChartsError]: (state, { payload: error }) => {
    return {
      ...state,
      fetchingAmiChartsError: error,
    }
  },
  [ListingDetailsActions.SetFetchingUnitsError]: (state, { payload: error }) => {
    return {
      ...state,
      fetchingUnitsError: error,
    }
  },
})

export default ListingDetailsReducer
