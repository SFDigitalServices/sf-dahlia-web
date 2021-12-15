import RailsRentalListing from "../api/types/rails/listings/RailsRentalListing"
import RailsSaleListing from "../api/types/rails/listings/RailsSaleListing"

export const areLotteryResultsShareable = (listing: RailsRentalListing | RailsSaleListing) =>
  listing.Publish_Lottery_Results && listing.Lottery_Status === "Lottery Complete"
