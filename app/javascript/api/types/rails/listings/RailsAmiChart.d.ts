export type RailsAmiChartValue = {
  year: string
  percent: number
  numOfHousehold: number
  chartType: string
  amount: number
}

export type RailsAmiChart = {
  percent: string
  derivedFrom: "MinAmi" | "MaxAmi"
  values: Array<RailsAmiChartValue>
  chartType?: string
}

export type RailsAmiChartMetaData = {
  derivedFrom: "MinAmi" | "MaxAmi"
  percent: number
  type: string
  year: number
}
