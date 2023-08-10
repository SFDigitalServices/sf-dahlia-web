export type RailsAmiChartValue = {
  year: string
  percent: number
  numOfHousehold: number
  chartType: string
  amount: number
}

export type RailsAmiChart = {
  percent: string
  derivedFrom: string
  values: Array<RailsAmiChartValue>
  year: string
  chartType?: string
}

export type RailsAmiChartMetaData = {
  derivedFrom: string
  percent: number
  type: string
  year: number
}
