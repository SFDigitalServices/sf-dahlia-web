import type { RailsLotteryResult } from "../../../api/types/rails/listings/RailsLotteryResult"

/**
 * LotteryResult for sale listing with NRHP and L/W preference ranks
 */
export const lotteryResultSaleTwo: RailsLotteryResult = {
  URL: null,
  publishLotteryResults: true,
  officeHours:
    "Monday-Friday 9:00 AM - 5:00 PM </>\r\nPlease call or email to schedule an appointment.",
  lotteryStatus: "Lottery Complete",
  lotteryResultsURL:
    "https://sfmohcd.org/sites/default/files/Documents/MOH/Lottery%20Results/The%20Oak%20Lottery%20Results%201.27.22.pdf",
  lotteryPreferences: null,
  lotteryEndTime: null,
  lotteryDate: "2022-01-27T22:30:00.000Z",
  lotteryCity: null,
  lotteryBuckets: [
    {
      unitsAvailable: 13,
      totalSubmittedApps: 0,
      preferenceResults: [],
      preferenceOrder: 1,
      preferenceName: "Certificate of Preference (COP)",
    },
    {
      unitsAvailable: 2,
      totalSubmittedApps: 0,
      preferenceResults: [],
      preferenceOrder: 2,
      preferenceName: "Displaced Tenant Housing Preference (DTHP)",
    },
    {
      unitsAvailable: 5,
      totalSubmittedApps: 6,
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 12,
          lotteryNumber: "00965716",
          applicationID: "a0o4U00000KSss9QAD",
        },
      ],
      preferenceOrder: 3,
      preferenceName: "Neighborhood Resident Housing Preference (NRHP)",
    },
    {
      unitsAvailable: 13,
      totalSubmittedApps: 56,
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 1,
          lotteryNumber: "00973486",
          applicationID: "a0o4U00000KTrrjQAD",
        },
      ],
      preferenceOrder: 4,
      preferenceName: "Live or Work in San Francisco Preference",
    },
    {
      unitsAvailable: 13,
      totalSubmittedApps: 5,
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 16,
          lotteryNumber: "00963026",
          applicationID: "a0o4U00000KSc9HQAT",
        },
      ],
      preferenceOrder: null,
      preferenceName: "generalLottery",
    },
  ],
  lotteryAppTotal: 60,
  listingId: "a0W4U00000KnEWYUA3",
}
