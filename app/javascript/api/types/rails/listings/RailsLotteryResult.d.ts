import type { RailsLotteryBucket } from "./RailsLotteryBucket"

export type RailsLotteryResult = {
  URL?: string
  listingId: string
  lotteryAppTotal: number
  lotteryBuckets: Array<RailsLotteryBucket>
  lotteryCity?: string
  lotteryDate: string
  lotteryEndTime?: string
  lotteryPreferences?: unknown
  lotteryResultsURL: string
  lotteryStatus: string
  officeHours: string
  publishLotteryResults: boolean
}
