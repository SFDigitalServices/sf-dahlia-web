import React from "react"
import { CategoryTable, ContentAccordion, Message } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"

export interface ListingDetailsPricingTableProps {
  listing: RailsListing
}

export const ListingDetailsPricingTable = ({ listing }: ListingDetailsPricingTableProps) => {
  /* TODO: Build unit summaries, remove mock data */
  const responsiveTableRows = [
    {
      units: { cellText: "Studio", cellSubText: "23 available" },
      income: { cellText: "Up to $6,854", cellSubText: "per month" },
      rent: { cellText: "30%", cellSubText: "income" },
    },
    {
      units: { cellText: "1 BR", cellSubText: "3 available" },
      income: { cellText: "$2,194 to $6,854", cellSubText: "per month" },
      rent: { cellText: "$1,295", cellSubText: "income" },
    },
  ]

  const responsiveTableHeaders = {
    units: { name: "t.unitType" },
    income: { name: "t.incomeRange" },
    rent: { name: "t.rent" },
  }

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
        customExpandedContent={
          <div className={"p-4 border-2 border-gray-400"}>
            <CategoryTable
              categoryData={[
                {
                  header: "Header 1",
                  tableData: { stackedData: responsiveTableRows, headers: responsiveTableHeaders },
                },
                {
                  header: "Header 2",
                  tableData: { stackedData: responsiveTableRows, headers: responsiveTableHeaders },
                },
              ]}
            />
          </div>
        }
        accordionTheme={"gray"}
        barClass={"mt-4"}
      />
    </div>
  )
}
