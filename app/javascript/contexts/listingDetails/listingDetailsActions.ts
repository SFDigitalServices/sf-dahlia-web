import { createAction } from "typesafe-actions"
import RailsUnit from "../../api/types/rails/listings/RailsUnit"
import { RailsAmiChart, RailsAmiChartMetaData } from "../../api/types/rails/listings/RailsAmiChart"

export type FinishFetchingAmiChartsType = {
  amiCharts: RailsAmiChart[]
  chartsToFetch: RailsAmiChartMetaData[]
}

export enum ListingDetailsActions {
  StartFetchingUnits = "SetFetchingUnits",
  FinishFetchingUnits = "FinishFetchingUnits",
  StartFetchingAmiCharts = "SetFetchingAmiCharts",
  SetFetchedAmiCharts = "SetFetchedAmiCharts",
  SetFetchingAmiChartsError = "SetFetchingAmiChartsError",
  SetFetchingUnitsError = "SetFetchingUnitsError",
  FinishFetchingAmiCharts = "FinishFetchingAmiCharts",
}

export const startFetchingUnits = createAction(ListingDetailsActions.StartFetchingUnits)()
export const finishFetchingAmiCharts = createAction(
  ListingDetailsActions.FinishFetchingAmiCharts
)<FinishFetchingAmiChartsType>()
export const setFetchedAmiCharts = createAction(ListingDetailsActions.SetFetchedAmiCharts)()
export const startFetchingAmiCharts = createAction(ListingDetailsActions.StartFetchingAmiCharts)()
export const finishFetchingUnits = createAction(ListingDetailsActions.FinishFetchingUnits)<
  RailsUnit[]
>()
export const setFetchingUnitsError = createAction(
  ListingDetailsActions.SetFetchingUnitsError
)<Error>()
export const setFetchingAmiChartsError = createAction(
  ListingDetailsActions.SetFetchingAmiChartsError
)<Error>()
