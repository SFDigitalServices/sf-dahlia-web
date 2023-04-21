import React from "react"
import { Heading, t } from "@bloom-housing/ui-components"

import { ListingAddress } from "../../components/ListingAddress"

export const getHabitatContent = (listing, stackedDataFxn) => {
  const getHeader = (header: string) => {
    return (
      <div
        className={
          "font-sans font-semibold text-base uppercase text-gray-750 tracking-wider border-0 border-b pb-2 mb-2 mt-4"
        }
      >
        {header}
      </div>
    )
  }
  const getHabitatContentRow = (prefix: string, content: string, key: string) => {
    return (
      <div key={key}>
        <span className={"font-semibold"}>{prefix}</span> {content}
      </div>
    )
  }

  const stackedData = stackedDataFxn(listing)

  return (
    <>
      <Heading priority={2} styleType={"largePrimary"} className={"order-1"}>
        {listing.Name}
      </Heading>
      <Heading priority={3} styleType={"mediumNormal"} className={"order-2"}>
        <ListingAddress listing={listing} />
      </Heading>
      <hr className={"mb-2"} />
      <div className={"text-gray-750"}>
        <Heading priority={3} styleType={"smallWeighted"}>
          {t("listings.availableUnits")}
        </Heading>
        {getHeader(t("t.units"))}
        {stackedData.map((row, index) =>
          getHabitatContentRow(
            `${row.unitType.cellText}:`,
            `${row.availability.cellText} ${t("t.available")}`,
            index
          )
        )}

        {getHeader(t("listings.habitat.payments"))}
        <div>{t("listings.habitat.payments.desc")}</div>
        <div className={"mt-4 border-0 border-b pb-2 mb-2"}>
          {t("listings.habitat.infoSession")}
        </div>
      </div>
    </>
  )
}
