import { t } from "@bloom-housing/ui-components"
import React from "react"
import { isEducatorTwo, isEducatorBrightwell, isPlusHousing } from "../../util/listingUtil"
import { getPriorityTypes } from "./DirectoryHelpers"
import RailsRentalListing from "../../api/types/rails/listings/RailsRentalListing"

type TableSubHeaderProps = {
  listing: RailsRentalListing
}

const TableSubHeader = ({ listing }: TableSubHeaderProps) => {
  const priorityTypes = getPriorityTypes(listing)
  return (
    (priorityTypes ||
      isEducatorTwo(listing) ||
      isEducatorBrightwell(listing) ||
      isPlusHousing(listing)) && (
      <div className="text__small-normal">
        {t("listings.includesPriorityUnits")}
        <ul className="list-disc ml-4">
          {isEducatorTwo(listing) && (
            <li>{t("listings.customListingType.educator.priorityUnits")}</li>
          )}
          {isEducatorBrightwell(listing) && (
            <>
              <li>
                {t(
                  "listings.customListingType.educator.brightwell.priorityUnits.cityCollegeEmployees"
                )}
              </li>
              <li>{t("listings.customListingType.educator.priorityUnits")}</li>
            </>
          )}
          {isPlusHousing(listing) && (
            <li>{t("listings.customListingType.plusHousing.priorityUnits.directory")}</li>
          )}
          {priorityTypes && priorityTypes.map((name) => <li key={name}>{name}</li>)}
        </ul>
      </div>
    )
  )
}

export default TableSubHeader
