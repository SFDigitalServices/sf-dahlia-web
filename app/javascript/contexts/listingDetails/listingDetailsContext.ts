import { createContext } from "react"
import RailsUnit from "../../api/types/rails/listings/RailsUnit"
import { RailsAmiChart, RailsAmiChartMetaData } from "../../api/types/rails/listings/RailsAmiChart"

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
