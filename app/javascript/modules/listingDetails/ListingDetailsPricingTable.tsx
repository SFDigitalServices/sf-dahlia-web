import React from "react"
import { ContentAccordion, Message } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"

export interface ListingDetailsPricingTableProps {
  listing: RailsListing
}

export const ListingDetailsPricingTable = ({ listing }: ListingDetailsPricingTableProps) => {
  /* TODO: Build unit summaries */

  const accordionTitle = (
    <span className={"flex w-full justify-between items-center"}>
      <span className={"flex items-center"}>
        <span className={"font-serif text-3xl font-medium leading-4 pr-2"}>#</span> person in
        household
      </span>
    </span>
  )
  return (
    <div className="w-full md:w-2/3 md:mt-6 md:mb-6 md:px-3 md:pr-8">
      {listing.Reserved_community_type && (
        <Message warning={true}>Reserved for: {listing.Reserved_community_type}</Message>
      )}
      <ContentAccordion
        customBarContent={accordionTitle}
        customExpandedContent={<>Pricing table</>}
        accordionTheme={"gray"}
        barClass={"mt-4"}
      />
    </div>
  )
}
