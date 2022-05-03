import { RailsLotteryBucket } from "./RailsLotteryBucket"

export type RailsLotteryBucketsDetails = {
  lotteryPreferences?: unknown
  lotteryResultsURL: string
  lotteryStatus: string
  officeHours: string
  publishLotteryResults: boolean
  URL?: string
  lotteryEndTime?: string
  lotteryDate: string
  lotteryCity?: string
  lotteryBuckets: Array<RailsLotteryBucket>
}
