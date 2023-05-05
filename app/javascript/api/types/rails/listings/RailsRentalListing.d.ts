import type BaseRailsListing from "./BaseRailsListing"
import type RailsRentalUnitSummary from "./RailsRentalUnitSummary"

type RailsRentalListing = BaseRailsListing & {
  unitSummaries: {
    reserved?: Array<RailsRentalUnitSummary>
    general?: Array<RailsRentalUnitSummary>
  }
}

export default RailsRentalListing
