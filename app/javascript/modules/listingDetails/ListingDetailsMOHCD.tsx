import React, { useContext } from "react"
import { Mobile, Desktop, t } from "@bloom-housing/ui-components"
import { ConfigContext } from "../../lib/ConfigContext"

export const ListingDetailsMOHCD = () => {
  const { getAssetPath } = useContext(ConfigContext)

  const MohcdEl = (
    <div className="m-0 info-card flex items-center justify-between">
      <p className="m-0 text-base text-serif-xl w-3/4">{t("listings.monitoredByMohcd")}</p>
      <img alt={t("listings.equalHousingOpportunityLogo")} src={getAssetPath("logo-equal.png")} />
    </div>
  )

  return (
    <>
      <Mobile>
        <div className="listing-detail-panel p-0">{MohcdEl}</div>
      </Mobile>
      <Desktop>
        <li className="listing-detail-panel p-0 list-none">{MohcdEl}</li>
      </Desktop>
    </>
  )
}
