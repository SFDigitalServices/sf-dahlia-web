import type { RailsLotteryResult } from "../../../api/types/rails/listings/RailsLotteryResult"

/**
 * LotteryResult for rental listing with COP, DTHP and L/W preference ranks
 */
export const lotteryResultRentalThree: RailsLotteryResult = {
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
      preferenceShortCode: "",
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 4,
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 9,
          lotteryNumber: "00972674",
          applicationID: "a0o4U00000KTlTYQA1",
        },
      ],
      preferenceOrder: 2,
      preferenceName: "Displaced Tenant Housing Preference (DTHP)",
      preferenceShortCode: "",
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 905,
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 1,
          lotteryNumber: "00972722",
          applicationID: "a0o4U00000KTlcHQAT",
        },
      ],
      preferenceOrder: 3,
      preferenceName: "Live or Work in San Francisco Preference",
      preferenceShortCode: "",
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 193,
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 13,
          lotteryNumber: "00972751",
          applicationID: "a0o4U00000KTlekQAD",
        },
      ],
      preferenceOrder: null,
      preferenceName: "generalLottery",
      preferenceShortCode: "",
    },
  ],
  lotteryAppTotal: 1098,
  listingId: "a0W4U00000KnHO6UAN",
}
