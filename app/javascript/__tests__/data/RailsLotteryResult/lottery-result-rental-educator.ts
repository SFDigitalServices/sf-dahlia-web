import type { RailsLotteryResult } from "../../../api/types/rails/listings/RailsLotteryResult"

/**
 * LotteryResult for rental listing with COP and L/W preference rank
 */
export const lotteryResultRentalEducator: RailsLotteryResult = {
  URL: null,
  publishLotteryResults: true,
  officeHours: null,
  lotteryStatus: "Lottery Complete",
  lotteryResultsURL: null,
  lotteryPreferences: null,
  lotteryEndTime: null,
  lotteryDate: null,
  lotteryCity: "San Francisco",
  lotteryBuckets: [
    {
      unitsAvailable: null,
      totalSubmittedApps: 0,
      preferenceShortCode: "T1-V-COP",
      preferenceResults: [],
      preferenceOrder: 1,
      preferenceName: "Tier 1 Veteran with Certificate of Preference",
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 0,
      preferenceShortCode: "T1-COP",
      preferenceResults: [],
      preferenceOrder: 2,
      preferenceName: "Tier 1 Certificate of Preference",
    },
    {
      unitsAvailable: null,
      totalSubmittedApps: 0,
      preferenceShortCode: "T1-V-DTHP",
      preferenceResults: [],
      preferenceOrder: 3,
      preferenceName: "Tier 1 Veteran with Displaced Tenant Housing Preference",
    },
    {
      unitsAvailable: null,
      totalSubmittedApps: 1,
      preferenceShortCode: "T1-DTHP",
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 2,
          lotteryNumber: "01264431",
          applicationID: "a0o8H000002EDYnQAO",
        },
      ],
      preferenceOrder: 4,
      preferenceName: "Tier 1 Displaced Tenant Housing Preference",
    },
    {
      unitsAvailable: null,
      totalSubmittedApps: 1,
      preferenceShortCode: "T1-V-NRHP",
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 7,
          lotteryNumber: "01264432",
          applicationID: "a0o8H000002EDYsQAO",
        },
      ],
      preferenceOrder: 5,
      preferenceName: "Tier 1 Veteran with Neighborhood Resident Housing Preference",
    },
    {
      unitsAvailable: null,
      totalSubmittedApps: 1,
      preferenceShortCode: "T1-NRHP",
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 7,
          lotteryNumber: "01264432",
          applicationID: "a0o8H000002EDYsQAO",
        },
      ],
      preferenceOrder: 6,
      preferenceName: "Tier 1 Neighborhood Resident Housing Preference",
    },
    {
      unitsAvailable: null,
      totalSubmittedApps: 2,
      preferenceShortCode: "T1-V-L_W",
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 6,
          lotteryNumber: "01264382",
          applicationID: "a0o8H000002EDUsQAO",
        },
      ],
      preferenceOrder: 7,
      preferenceName: "Tier 1 Veteran with Live or Work in San Francisco Preference",
    },
    {
      unitsAvailable: null,
      totalSubmittedApps: 3,
      preferenceShortCode: "T1-L_W",
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 2,
          lotteryNumber: "01264431",
          applicationID: "a0o8H000002EDYnQAO",
        },
      ],
      preferenceOrder: 8,
      preferenceName: "Tier 1 Live or Work in San Francisco Preference",
    },
    {
      unitsAvailable: null,
      totalSubmittedApps: 0,
      preferenceShortCode: "T2-V-COP",
      preferenceResults: [],
      preferenceOrder: 9,
      preferenceName: "Tier 2 Veteran with Certificate of Preference",
    },
    {
      unitsAvailable: null,
      totalSubmittedApps: 1,
      preferenceShortCode: "T2-COP",
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 4,
          lotteryNumber: "01264430",
          applicationID: "a0o8H000002EDYiQAO",
        },
      ],
      preferenceOrder: 10,
      preferenceName: "Tier 2 Certificate of Preference",
    },
    {
      unitsAvailable: null,
      totalSubmittedApps: 1,
      preferenceShortCode: "T2-V-DTHP",
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 3,
          lotteryNumber: "01264426",
          applicationID: "a0o8H000002EDYOQA4",
        },
      ],
      preferenceOrder: 11,
      preferenceName: "Tier 2 Veteran with Displaced Tenant Housing Preference",
    },
    {
      unitsAvailable: null,
      totalSubmittedApps: 1,
      preferenceShortCode: "T2-DTHP",
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 3,
          lotteryNumber: "01264426",
          applicationID: "a0o8H000002EDYOQA4",
        },
      ],
      preferenceOrder: 12,
      preferenceName: "Tier 2 Displaced Tenant Housing Preference",
    },
    {
      unitsAvailable: null,
      totalSubmittedApps: 0,
      preferenceShortCode: "T2-V-NRHP",
      preferenceResults: [],
      preferenceOrder: 13,
      preferenceName: "Tier 2 Veteran with Neighborhood Resident Housing Preference",
    },
    {
      unitsAvailable: null,
      totalSubmittedApps: 1,
      preferenceShortCode: "T2-NRHP",
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 4,
          lotteryNumber: "01264430",
          applicationID: "a0o8H000002EDYiQAO",
        },
      ],
      preferenceOrder: 14,
      preferenceName: "Tier 2 Neighborhood Resident Housing Preference",
    },
    {
      unitsAvailable: null,
      totalSubmittedApps: 1,
      preferenceShortCode: "T2-V-L_W",
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 3,
          lotteryNumber: "01264426",
          applicationID: "a0o8H000002EDYOQA4",
        },
      ],
      preferenceOrder: 15,
      preferenceName: "Tier 2 Veteran with Live or Work in San Francisco Preference",
    },
    {
      unitsAvailable: null,
      totalSubmittedApps: 2,
      preferenceShortCode: "T2-L_W",
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 3,
          lotteryNumber: "01264426",
          applicationID: "a0o8H000002EDYOQA4",
        },
      ],
      preferenceOrder: 16,
      preferenceName: "Tier 2 Live or Work in San Francisco Preference",
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 1,
      preferenceShortCode: "COP",
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 4,
          lotteryNumber: "01264430",
          applicationID: "a0o8H000002EDYiQAO",
        },
      ],
      preferenceOrder: 17,
      preferenceName: "Certificate of Preference (COP)",
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 2,
      preferenceShortCode: "DTHP",
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 2,
          lotteryNumber: "01264431",
          applicationID: "a0o8H000002EDYnQAO",
        },
      ],
      preferenceOrder: 18,
      preferenceName: "Displaced Tenant Housing Preference (DTHP)",
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 2,
      preferenceShortCode: "NRHP",
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 4,
          lotteryNumber: "01264430",
          applicationID: "a0o8H000002EDYiQAO",
        },
      ],
      preferenceOrder: 19,
      preferenceName: "Neighborhood Resident Housing Preference (NRHP)",
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 5,
      preferenceShortCode: "L_W",
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 2,
          lotteryNumber: "01264431",
          applicationID: "a0o8H000002EDYnQAO",
        },
      ],
      preferenceOrder: 20,
      preferenceName: "Live or Work in San Francisco Preference",
    },
    {
      unitsAvailable: 1,
      totalSubmittedApps: 2,
      preferenceShortCode: null,
      preferenceResults: [
        {
          preferenceRank: 1,
          lotteryRank: 1,
          lotteryNumber: "01264427",
          applicationID: "a0o8H000002EDYTQA4",
        },
      ],
      preferenceOrder: null,
      preferenceName: "generalLottery",
    },
  ],
  lotteryAppTotal: 7,
  listingId: "a0W8H000001hvBbUAI",
}
