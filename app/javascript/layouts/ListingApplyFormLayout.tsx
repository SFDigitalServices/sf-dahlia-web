import React from "react"
import { Card } from "@bloom-housing/ui-seeds"
import type { RailsListing } from "../modules/listings/SharedHelpers"

interface ListingApplyFormLayout {
  listing: RailsListing
  showNavbar: boolean
  // initialFormState: 
  children: React.ReactNode
}

const ListingApplyFormLayout = ({ listing, showNavbar, children }: ListingApplyFormLayout) => {

  return (
    <>
      <Card>
        <p>{listing.Name}</p>
        {showNavbar && (
          <p>TODO NAVBAR</p>
          /* <p>{JSON.stringify(sectionNames)}/p> */
        )}
      </Card>
      {children}
    </>
  )
}

export default ListingApplyFormLayout
