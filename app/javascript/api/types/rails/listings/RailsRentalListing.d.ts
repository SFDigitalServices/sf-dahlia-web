import BaseRailsListing from "./BaseRailsListing"
import RailsRentalUnitSummary from "./RailsRentalUnitSummary"

type RailsRentalListing = BaseRailsListing & {
  unitSummaries: {
    reserved?: Array<RailsRentalUnitSummary>
    general?: Array<RailsRentalUnitSummary>
  }
}

export default RailsRentalListing
