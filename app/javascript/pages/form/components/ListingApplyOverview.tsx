import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button, Heading } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import styles from "./ListingApplyOverview.module.scss"
import { getDocumentChecklistPath } from "../../../util/routeUtil"
import { getCurrentLanguage, LanguagePrefix, renderInlineMarkup } from "../../../util/languageUtil"

const ListingApplyOverview = () => {
  const formEngineContext = useFormEngineContext()
  const { handleNextStep } = formEngineContext

  return (
    <div className={styles["listing-apply-overview"]}>
      <CardSection>
        <Heading priority={2} size="2xl" className={styles["listing-apply-overview-title"]}>
          {t("a4Overview.title")}
        </Heading>
        {getCurrentLanguage() === LanguagePrefix.Chinese && (
          <p className={styles["listing-apply-overview-chinese"]}>{t("a4Overview.subtitle")}</p>
        )}
        <hr />
        <div className={styles["listing-apply-overview-text"]}>
          <p>{t("a4Overview.p1")}</p>
          <p>{renderInlineMarkup(t("a4Overview.p2", { href: getDocumentChecklistPath() }))}</p>
          <p>{t("a4Overview.p3")}</p>
          <p>{t("a4Overview.p4")}</p>
          <p>{t("a4Overview.warning")}</p>
        </div>
      </CardSection>
      <CardSection className={styles["listing-apply-overview-footer"]}>
        <Button variant="primary" onClick={handleNextStep}>
          {t("t.next")}
        </Button>
      </CardSection>
    </div>
  )
}

export default ListingApplyOverview
