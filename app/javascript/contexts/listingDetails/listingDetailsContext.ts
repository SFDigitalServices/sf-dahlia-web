import { createContext } from "react"
import type RailsUnit from "../../api/types/rails/listings/RailsUnit"
import type {
  RailsAmiChart,
  RailsAmiChartMetaData,
} from "../../api/types/rails/listings/RailsAmiChart"

export type ContextProps = {
  units: RailsUnit[]
  amiCharts: RailsAmiChart[]
  fetchedAmiCharts: boolean
  fetchingAmiCharts: boolean
  fetchedUnits: boolean
  fetchingUnits: boolean
  fetchUnits: (listingId: string) => void
  fetchAmiCharts: (chartsToFetch: RailsAmiChartMetaData[]) => void
  fetchingAmiChartsError: Error
  fetchingUnitsError: Error
}

export default createContext<Partial<ContextProps>>({})
