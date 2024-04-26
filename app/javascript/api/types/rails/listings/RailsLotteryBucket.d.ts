type PreferenceResult = {
  applicationID: string
  lotteryNumber: string
  lotteryRank: number
  preferenceRank: number
}

export type RailsLotteryBucket = {
  preferenceName: string
  preferenceOrder: number
  preferenceResults?: Array<PreferenceResult>
  totalSubmittedApps: number
  unitsAvailable: number
  preferenceShortCode: string
}
