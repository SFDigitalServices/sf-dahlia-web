import { createContext } from "react"
import { RailsUnit } from "../../api/types/rails/listings/RailsUnit"
import { RailsAmiChart } from "../../api/types/rails/listings/RailsAmiChart"

export type AmiChartData = {
  years: Array<number>
  percentages: Array<number>
  types: Array<string>
}

export type ContextProps = {
  units: RailsUnit[]
  amiCharts: RailsAmiChart[]
  fetchedAmiCharts: boolean
  fetchingAmiCharts: boolean
  fetchedUnits: boolean
  fetchingUnits: boolean
  amiChartData: AmiChartData
  fetchUnits: (listingId: string) => void
  fetchAmiCharts: (year: Array<number>, percentages: Array<number>, types: Array<string>) => void
  fetchingAmiChartsError: Error
  fetchingUnitsError: Error
}

export default createContext<Partial<ContextProps>>({})
