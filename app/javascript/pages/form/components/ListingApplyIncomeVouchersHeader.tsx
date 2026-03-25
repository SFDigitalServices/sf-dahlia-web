import React from "react"
import { t } from "@bloom-housing/ui-components"
import { CardHeader } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import listingApplyStepWrapperStyles from "./ListingApplyStepWrapper.module.scss"
import { renderInlineMarkup } from "../../../util/languageUtil"
import styles from "./ListingApplyStepWrapper.module.scss"

const ListingApplyIncomeVouchersHeader = () => {
  const formEngineContext = useFormEngineContext()
  const { formData } = formEngineContext

  const titleString =
    formData.liveAlone === "false"
      ? t("d1IncomeVouchers.titleHousehold")
      : t("d1IncomeVouchers.titleYou")

  return (
    <CardHeader divider="inset">
      <h1 className={listingApplyStepWrapperStyles["step-title"]}>{titleString}</h1>
      <p className={styles["step-description"]}>{renderInlineMarkup(t("d1IncomeVouchers.p1"))}</p>
      <p className={styles["step-description"]}>{renderInlineMarkup(t("d1IncomeVouchers.p2"))}</p>
      <p className={styles["step-description"]}>{renderInlineMarkup(t("d1IncomeVouchers.p3"))}</p>
    </CardHeader>
  )
}

export default ListingApplyIncomeVouchersHeader
