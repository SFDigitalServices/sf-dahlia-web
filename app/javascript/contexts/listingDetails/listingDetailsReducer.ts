import { createReducer } from "typesafe-actions"
import { ListingDetailsActions } from "./listingDetailsActions"
import { RailsUnit } from "../../api/types/rails/listings/RailsUnit"
import { RailsAmiChart } from "../../api/types/rails/listings/RailsAmiChart"
import { AmiChartData } from "./listingDetailsContext"

type ListingDetailsState = {
  fetchingUnits: boolean
  fetchedUnits: boolean
  fetchingAmiCharts: boolean
  fetchedAmiCharts: boolean
  units: RailsUnit[]
  amiChartData: AmiChartData
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
    const amiChartYears: Array<number> = []
    const amiChartTypes = []
    const amiChartPercentages = []

    units.forEach((unit: RailsUnit) => {
      const amiChartYear = amiChartYears.find((year) => {
        return year === unit.AMI_chart_year
      })

      const amiChartType = amiChartTypes.find((type) => {
        return type === unit.AMI_chart_type
      })

      const amiChartPercentage = amiChartPercentages.find((type) => {
        return type === unit.Max_AMI_for_Qualifying_Unit
      })

      if (!amiChartYear) {
        amiChartYears.push(unit.AMI_chart_year)
      }

      if (!amiChartType) {
        amiChartTypes.push(unit.AMI_chart_type)
      }

      if (!amiChartPercentage) {
        amiChartPercentages.push(unit.Max_AMI_for_Qualifying_Unit)
      }
    })

    return {
      ...state,
      fetchingUnits: false,
      fetchedUnits: true,
      units,
      amiChartData: {
        years: amiChartYears,
        percentages: amiChartPercentages,
        types: amiChartTypes,
      },
    }
  },
  [ListingDetailsActions.FinishFetchingAmiCharts]: (state, { payload: amiCharts }) => {
    return {
      ...state,
      fetchingAmiCharts: false,
      fetchedAmiCharts: true,
      amiCharts: amiCharts?.map((amiChart: RailsAmiChart) => {
        return {
          ...amiChart,
          chartType: amiChart?.values[0]?.chartType,
        }
      }),
    }
  },
})

export default ListingDetailsReducer
