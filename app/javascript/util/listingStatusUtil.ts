import RailsRentalListing from "../api/types/rails/listings/RailsRentalListing"

export const areLotteryResultsShareable = (listing: RailsRentalListing) =>
  listing.Publish_Lottery_Results && listing.Lottery_Status === "Lottery Complete"
