import { RailsLotteryBucket } from "./RailsLotteryBucket"

export type RailsLotteryRanking = {
  URL?: string
  publishLotteryResults: boolean
  officeHours: string
  lotteryStatus: string
  lotteryResultsURL: string
  lotteryPreferences?: string
  lotteryEndTime?: string
  lotteryDate?: string
  lotteryCity?: string
  lotteryBuckets: RailsLotteryBucket[]
}
