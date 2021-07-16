import BaseRailsListing from "./BaseRailsListing"
import RailsSaleUnitSummary from "./RailsSaleUnitSummary"

type RailsSaleListing = BaseRailsListing & {
  unitSummaries: {
    reserved?: Array<RailsSaleUnitSummary>
    general?: Array<RailsSaleUnitSummary>
  }
}

export default RailsSaleListing
