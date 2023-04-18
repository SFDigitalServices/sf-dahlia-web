import { createAction } from "typesafe-actions"
import { RailsUnit } from "../../api/types/rails/listings/RailsUnit"
import { RailsAmiChart } from "../../api/types/rails/listings/RailsAmiChart"

export enum ListingDetailsActions {
  StartFetchingUnits = "SetFetchingUnits",
  FinishFetchingUnits = "FinishFetchingUnits",
  SetUnits = "SetUnits",
  SetAmiCharts = "SetAmiCharts",
  StartFetchingAmiCharts = "SetFetchingAmiCharts",
  SetFetchedAmiCharts = "SetFetchedAmiCharts",
  SetFetchingAmiChartsError = "SetFetchingAmiChartsError",
  SetFetchingUnitsError = "SetFetchingUnitsError",
  FinishFetchingAmiCharts = "FinishFetchingAmiCharts",
}

export const startFetchingUnits = createAction(ListingDetailsActions.StartFetchingUnits)()
export const setUnits = createAction(ListingDetailsActions.SetUnits)()
export const setAmiCharts = createAction(ListingDetailsActions.SetAmiCharts)()
export const finishFetchingAmiCharts = createAction(ListingDetailsActions.FinishFetchingAmiCharts)<
  RailsAmiChart[]
>()
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
