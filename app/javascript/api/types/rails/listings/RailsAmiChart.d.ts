export type RailsAmiChartValue = {
  year: string
  percent: number
  numOfHousehold: number
  chartType: string
  amount: number
}

export type RailsAmiChart = {
  percent: string
  values: Array<RailsAmiChartValue>
  year: string
  chartType?: string
}

export type RailsAmiChartMetaData = {
  percent: number
  type: string
  year: number
}
