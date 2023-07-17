import type { RailsLotteryResult } from "../../../api/types/rails/listings/RailsLotteryResult"

/**
 * LotteryResult for rental listing with COP and L/W preference rank
 */
export const lotteryResultRentalTwo: RailsLotteryResult = {
  URL: null,
  publishLotteryResults: true,
  officeHours: "Monday - Friday 10:00 AM - 6:00 PM",
  lotteryStatus: "Lottery Complete",
  lotteryResultsURL:
    "https://sfmohcd.org/sites/default/files/Documents/MOH/Lottery%20Results/855%20Brannan%20%23318%20Lottery%20Results%201.26.22.pdf",
  lotteryPreferences: null,
  lotteryEndTime: null,
  lotteryDate: "2022-01-25T19:00:00.000Z",
  lotteryCity: null,
  lotteryBuckets: [
    {
      unitsAvailable: 1,
      totalSubmittedApps: 1,
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 462,
          lotteryNumber: "00972877",
          applicationID: "a0o4U00000KTlwTQAT",
        },
      ],
      preferenceOrder: 1,
      preferenceName: "Certificate of Preference (COP)",
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 4,
      preferenceResults: [],
      preferenceOrder: 2,
      preferenceName: "Displaced Tenant Housing Preference (DTHP)",
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 905,
      preferenceResults: [
        {
          preferenceRank: 374,
          lotteryRank: 462,
          lotteryNumber: "00972877",
          applicationID: "a0o4U00000KTlwTQAT",
        },
      ],
      preferenceOrder: 3,
      preferenceName: "Live or Work in San Francisco Preference",
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 193,
      preferenceResults: [],
      preferenceOrder: null,
      preferenceName: "generalLottery",
    },
  ],
  lotteryAppTotal: 1098,
  listingId: "a0W4U00000KnHO6UAN",
}
