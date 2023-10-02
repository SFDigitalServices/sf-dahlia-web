import { t } from "@bloom-housing/ui-components"
import React from "react"
import { isEducatorTwo } from "../../util/listingUtil"
import { getPriorityTypes } from "./DirectoryHelpers"
import RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"

type TableSubHeaderProps = {
  listing: RailsRentalListing
}

const TableSubHeader = ({ listing }: TableSubHeaderProps) => {
  const priorityTypes = getPriorityTypes(listing)
  return (
    (priorityTypes || isEducatorTwo(listing)) && (
      <div>
        {t("listings.includesPriorityUnits")}
        <ul className="list-disc ml-4">
          {isEducatorTwo(listing) && 
            <li>{t("listings.customListingType.educator.priorityUnits")}</li>
          }
          {priorityTypes && priorityTypes.map((name) => (<li key={name}>{name}</li>))}
        </ul>
      </div>
    )
  )
}

export default TableSubHeader
