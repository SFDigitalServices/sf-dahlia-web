import type { RailsLotteryResult } from "../../../api/types/rails/listings/RailsLotteryResult"

/**
 * LotteryResult response for rental listing that is invalid. Salesforce returns
 * lotteryBuckets array with each of the preferenceResults having an empty array
 */
export const lotteryResultRentalInvalidLotteryNumber: RailsLotteryResult = {
  URL: null,
  publishLotteryResults: true,
  officeHours:
    "Monday to Friday, 10:00 am to 5:00 pm <br/>Please call, email, or text to schedule an appointment.",
  lotteryStatus: "Lottery Complete",
  lotteryResultsURL:
    "https://sfmohcd.org/sites/default/files/Documents/MOH/Lottery%20Results/55%20Page%20Street%20Unit%20211%20Lottery%20Results.pdf",
  lotteryPreferences: null,
  lotteryEndTime: null,
  lotteryDate: "2021-12-20T19:00:00.000Z",
  lotteryCity: null,
  lotteryBuckets: [
    {
      unitsAvailable: 1,
      totalSubmittedApps: 0,
      preferenceResults: [],
      preferenceOrder: 1,
      preferenceName: "Certificate of Preference (COP)",
      preferenceShortCode: "",
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 0,
      preferenceResults: [],
      preferenceOrder: 2,
      preferenceName: "Displaced Tenant Housing Preference (DTHP)",
      preferenceShortCode: "",
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 1,
      preferenceResults: [],
      preferenceOrder: 3,
      preferenceName: "Live or Work in San Francisco Preference",
      preferenceShortCode: "",
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 2,
      preferenceResults: [],
      preferenceOrder: null,
      preferenceName: "generalLottery",
      preferenceShortCode: "",
    },
  ],
  lotteryAppTotal: 3,
  listingId: "a0W4U00000KnFqKUAV",
}
