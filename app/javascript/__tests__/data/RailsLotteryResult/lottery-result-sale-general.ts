import type { RailsLotteryResult } from "../../../api/types/rails/listings/RailsLotteryResult"

/**
 * LotteryResult for sale listing with general pool rank
 */
export const lotteryResultSaleGeneral: RailsLotteryResult = {
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
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 0,
      preferenceResults: [],
      preferenceOrder: 2,
      preferenceName: "Displaced Tenant Housing Preference (DTHP)",
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 1,
      preferenceResults: [],
      preferenceOrder: 3,
      preferenceName: "Live or Work in San Francisco Preference",
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 2,
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 1,
          lotteryNumber: "00968818",
          applicationID: "a0o4U00000KTDHqQAP",
        },
      ],
      preferenceOrder: null,
      preferenceName: "generalLottery",
    },
  ],
  lotteryAppTotal: 3,
  listingId: "a0W4U00000KnFqKUAV",
}
