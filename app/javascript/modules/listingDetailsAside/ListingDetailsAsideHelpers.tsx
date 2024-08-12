import { t } from "@bloom-housing/ui-components"
import React from "react"

export const SeeThisUnitMLS = ({ url }: { url: string }) => {
  return (
    <p className="mt-1">
      <a href={url} target="_blank">
        {t("listings.process.seeThisUnitOnMls")}
      </a>
    </p>
  )
}
