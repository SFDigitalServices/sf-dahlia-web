import RailsRentalListing from "../api/types/rails/listings/RailsRentalListing"
import RailsSaleListing from "../api/types/rails/listings/RailsSaleListing"
import { ListingEvent } from "../api/types/rails/listings/BaseRailsListing"
import { RailsListingPricingTableUnit } from "../api/types/rails/listings/RailsListingPricingTableUnit"
import dayjs from "dayjs"
import { RESERVED_COMMUNITY_TYPES, TENURE_TYPES } from "../modules/constants"
import { RailsListing } from "../modules/listings/SharedHelpers"
import { LANGUAGE_CONFIGS } from "./languageUtil"

export const areLotteryResultsShareable = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Publish_Lottery_Results && listing.Lottery_Status === "Lottery Complete"

/**
 * Check if a listing is for Habitat for Humanity
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is for Habitat for Humanity, false otherwise
 */
export const isHabitatListing = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Reserved_community_type === RESERVED_COMMUNITY_TYPES.HABITAT

/**
 * Check if lottery is complete for a listing
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the lottery is complete and has a lottery date, false otherwise
 */
export const isLotteryComplete = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Publish_Lottery_Results && listing.Lottery_Status === "Lottery Complete"

/**
 * Check if a listing is open for applying
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is accepting applications, false otherwise
 */
export const isOpen = (listing: RailsRentalListing | RailsSaleListing) =>
  dayjs(listing.Application_Due_Date) > dayjs()

/**
 * Check if a listing is a rental
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is a rental, false otherwise
 */
export const isRental = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Tenure === TENURE_TYPES.NEW_RENTAL || listing.Tenure === TENURE_TYPES.RE_RENTAL

/**
 * Check if a listing is a sale
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is a sale, false otherwise
 */
export const isSale = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Tenure === TENURE_TYPES.NEW_SALE || listing.Tenure === TENURE_TYPES.RESALE

/**
 * Check if a listing is BMR
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is BMR, false otherwise
 */
export const isBMR = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Program_Type === "IH-RENTAL" || listing.Program_Type === "IH-OWN"

/**
 * Check if a listing has only SRO units
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing has all SRO unit types, false otherwise
 */
export const listingHasOnlySROUnits = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.unitSummaries.general.every((unit) => unit.unitType === "SRO")

/**
 * Check if a listing has at least one SRO unit
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing has at least one SRO unit type, false otherwise
 */
export const listingHasSROUnits = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.unitSummaries.general.some((unit) => unit.unitType === "SRO")
/**
 * Check if a listing is multi-occupancy SRO
 * @param {string} name
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is in the harcoded list of SROs that
 * permit multiple occupancy, false otherwise
 */
export const isPluralSRO = (name: string, listing: RailsRentalListing | RailsSaleListing) =>
  process.env.SRO_PLURAL_LISTINGS?.[listing.Id] === name

/**
 * Builds and return an address string. Not to be used for display. Use
 * {@link ListingAddress} instead.
 * @param  {RailsRentalListing | RailsRentalListing} listing
 * @returns {string} the full address string if all required fields are present, empty
 * string otherwise
 */
export const getListingAddressString = (listing: RailsListing): string => {
  return (
    (listing.Building_Street_Address &&
      listing.Building_City &&
      listing.Building_State &&
      listing.Building_Zip_Code &&
      `${listing.Building_Street_Address}, ${listing.Building_City}, ${listing.Building_State} ${listing.Building_Zip_Code}`) ||
    ""
  )
}

export const getEventTimeString = (listingEvent: ListingEvent) => {
  if (listingEvent.Start_Time) {
    return listingEvent.End_Time
      ? `${listingEvent.Start_Time} - ${listingEvent.End_Time}`
      : listingEvent.Start_Time
  }
  return ""
}

/**
 * Check if a listing is accepting paper applications
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is accepting paper applications, false otherwise
 */
export const acceptingPaperApplications = (listing: RailsListing): boolean => {
  return listing.Accepting_applications_at_leasing_agent || listing.Accepting_applications_by_PO_Box
}

type PaperApplication = {
  languageString: string
  fileURL: string
}

/**
 * Returns an array of all the paper application URLs
 * @param {boolean} isRental
 * @returns {PaperApplication[]}
 */
export const paperApplicationURLs = (isRental: boolean): PaperApplication[] => {
  const mohcdPaperAppURLBase = "https://sfmohcd.org/sites/default/files/Documents/MOH/"

  const mohcdRentalPaperAppURLTemplate =
    mohcdPaperAppURLBase +
    "BMR%20Rental%20Paper%20Applications/" +
    "{lang}%20BMR%20Rent%20Short%20Form%20Paper%20App.pdf"

  const mohcdSalePaperAppURLTemplate =
    mohcdPaperAppURLBase +
    "BMR%20Ownership%20Paper%20Applications/" +
    "{lang}%20BMR%20Own%20Short%20Form%20Paper%20App.pdf"

  const paperAppLanguages = [
    { language: "English", prefix: "en" },
    { language: "Spanish", prefix: "es" },
    { language: "Chinese", prefix: "zh" },
    { language: "Tagalog", prefix: "tl" },
  ]

  const urlBase = isRental ? mohcdRentalPaperAppURLTemplate : mohcdSalePaperAppURLTemplate
  return paperAppLanguages.map(
    (lang): PaperApplication => {
      return {
        languageString: LANGUAGE_CONFIGS[lang.prefix].getLabel(),
        fileURL: urlBase.replace("{lang}", lang.language),
      }
    }
  )
}

// export const classifyPricingDataByOccupancy = (units: RailsListingPricingTableUnit[]) => {
//   const mappedUnitsByOccupancy = []
//   units.forEach((unit: RailsListingPricingTableUnit) => {

//     for (let i = unit.minOccupancy; i <= unit.maxOccupancy; i++){
//       console.log('we gotta add something', i);
//     }

//     const mappedOccupancy = mappedUnitsByOccupancy.find((s) => {
//       return s.occupancy === unit.maxOccupancy
//     })

//     if (!mappedOccupancy) {
//       mappedUnitsByOccupancy.push({
//         occupancy: unit.maxOccupancy,
//         listingId: unit.listingID,
//         summaryByAMI: [
//           {
//             unitMaxAMI: unit.unitMaxAMI,
//             summaryByType: [{ ...unit }],
//           },
//         ],
//       })
//     } else {
//       const ami = mappedOccupancy.summaryByAMI.find((s) => {
//         return unit.unitMaxAMI === s.unitMaxAMI
//       })

//       if (ami) {
//         ami.summaryByType.push({
//           ...unit,
//         })
//       } else {
//         mappedOccupancy.summaryByAMI.push({
//           unitMaxAMI: unit.unitMaxAMI,
//           summaryByType: [{ ...unit }],
//         })
//       }
//     }
//   })

//   return mappedUnitsByOccupancy
// }

export const classifyPricingDataByOccupancy = (units: RailsListingPricingTableUnit[]) => {
  const mappedUnitsByOccupancy = []
  units.forEach((unit: RailsListingPricingTableUnit) => {
    for (let i = unit.minOccupancy; i <= unit.maxOccupancy; i++) {
      const mappedOccupancy = mappedUnitsByOccupancy.find((s) => {
        return s.occupancy === i
      })

      if (!mappedOccupancy) {
        mappedUnitsByOccupancy.push({
          occupancy: i,
          listingId: unit.listingID,
          absoluteMinIncome: unit.absoluteMinIncome,
          absoluteMaxIncome: unit.absoluteMaxIncome,
          summaryByAMI: [
            {
              unitMaxAMI: unit.unitMaxAMI,
              summaryByType: [{ ...unit }],
            },
          ],
        })
      } else {
        const ami = mappedOccupancy.summaryByAMI.find((s) => {
          return unit.unitMaxAMI === s.unitMaxAMI
        })

        if (ami) {
          ami.summaryByType.push({
            ...unit,
          })
        } else {
          mappedOccupancy.summaryByAMI.push({
            unitMaxAMI: unit.unitMaxAMI,
            summaryByType: [{ ...unit }],
          })
        }
      }
    }
  })

  return mappedUnitsByOccupancy
}
