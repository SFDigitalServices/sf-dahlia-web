import RailsRentalListing from "../api/types/rails/listings/RailsRentalListing"
import RailsSaleListing from "../api/types/rails/listings/RailsSaleListing"
import { ListingEvent } from "../api/types/rails/listings/BaseRailsListing"
import dayjs from "dayjs"
import { RESERVED_COMMUNITY_TYPES, TENURE_TYPES } from "../modules/constants"
import { RailsListing } from "../modules/listings/SharedHelpers"

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

export const listingEventHasDate = (listingEvent: ListingEvent) => {
  return listingEvent?.Date
}

export const getEventTimeString = (listingEvent: ListingEvent) => {
  if (listingEvent.Start_Time) {
    return listingEvent.End_Time
      ? `${listingEvent.Start_Time} - ${listingEvent.End_Time}`
      : listingEvent.Start_Time
  }
  return ""
}
