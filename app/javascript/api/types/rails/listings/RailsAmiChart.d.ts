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
  chartType?: string
}
