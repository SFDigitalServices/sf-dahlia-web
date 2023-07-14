import type BaseRailsListing from "./BaseRailsListing"
import type RailsSaleUnitSummary from "./RailsSaleUnitSummary"

type RailsSaleListing = BaseRailsListing & {
  unitSummaries: {
    reserved?: Array<RailsSaleUnitSummary>
    general?: Array<RailsSaleUnitSummary>
  }
}

export default RailsSaleListing
