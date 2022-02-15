import React from "react"

import { t } from "@bloom-housing/ui-components"

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
  const getHabitatContentRow = (prefix: string, content: string) => {
    return (
      <div>
        <span className={"font-semibold"}>{prefix}</span> {content}
      </div>
    )
  }

  const stackedData = stackedDataFxn(listing)

  return (
    <div className={"text-gray-750"}>
      <div className={"font-alt-sans font-semibold text-base mb-2 text-gray-900"}>
        {t("listings.availableUnits")}
      </div>
      {getHeader(t("t.units"))}
      {stackedData.map((row) =>
        getHabitatContentRow(
          `${row.unitType.cellText}:`,
          `${row.availability.cellText} ${t("t.available")}`
        )
      )}

      {getHeader(t("listings.habitat.payments"))}
      <div>{t("listings.habitat.payments.desc")}</div>
      <div className={"mt-4  border-0 border-b pb-2 mb-2"}>{t("listings.habitat.infoSession")}</div>
    </div>
  )
}
