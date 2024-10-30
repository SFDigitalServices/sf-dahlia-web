import { Card, Link } from "@bloom-housing/ui-seeds"
import { getSfGovUrl } from "../../util/languageUtil"
import { CardFooter, CardHeader, CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { t } from "@bloom-housing/ui-components"

import React from "react"
import "./fcfsNoLotteryRequired.scss"

export const fcfsNoLotteryRequired = () => {
  const url = getSfGovUrl(
    "https://www.sf.gov/step-by-step/buy-home-without-entering-lottery",
    14246
  )
  return (
    <Card className="fcfs-no-lottery">
      <CardHeader className="font-bold fcfs-no-lottery-header">
        {t("listings.fcfs.bmrSales.noLotteryRequired.header")}
      </CardHeader>
      <CardSection className="fcfs-no-lottery-section">
        {t("listings.fcfs.bmrSales.noLotteryRequired.section")}
      </CardSection>
      <CardFooter className="ml-6 mb-6 underline fcfs-no-lottery-section">
        <Link href={url} hideExternalLinkIcon={true}>
          {t("listings.fcfs.bmrSales.noLotteryRequired.footer")}
        </Link>
      </CardFooter>
    </Card>
  )
}
