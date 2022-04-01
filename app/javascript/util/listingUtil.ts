import RailsRentalListing from "../api/types/rails/listings/RailsRentalListing"
import RailsSaleListing from "../api/types/rails/listings/RailsSaleListing"
import dayjs from "dayjs"

export const areLotteryResultsShareable = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Publish_Lottery_Results && listing.Lottery_Status === "Lottery Complete"

/**
 * Check if a listing is a rental
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is a rental, false otherwise
 */
export const isRental = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Tenure === "New rental" || listing.Tenure === "Re-rental"

/**
 * Check if a listing is open for applying
 * @param {RailsRentalListing | RailsRentalListing} listing
 * @returns {boolean} returns true if the listing is accepting applications, false otherwise
 */
export const isOpen = (listing: RailsRentalListing | RailsSaleListing) =>
  dayjs(listing.Application_Due_Date) > dayjs()
