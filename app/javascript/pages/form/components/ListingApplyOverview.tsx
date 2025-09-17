import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button, Heading } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import "./ListingApplyOverview.scss"
import { getDocumentChecklistPath } from "../../../util/routeUtil"
import { getCurrentLanguage, LanguagePrefix, renderInlineMarkup } from "../../../util/languageUtil"

const ListingApplyOverview = () => {
  const formEngineContext = useFormEngineContext()
  const { handleNextStep, handlePrevStep } = formEngineContext

  return (
    <div className="listing-apply-overview">
      <CardSection>
        <Button variant="text" onClick={handlePrevStep}>
          {t("t.back")}
        </Button>
      </CardSection>
      <CardSection>
        <Heading priority={2} size="2xl" className="listing-apply-overview-title">
          {t("a4Overview.title")}
        </Heading>
        {getCurrentLanguage() === LanguagePrefix.Chinese && <p>{t("a4Overview.subtitle")}</p>}
        <hr />
        <div className="listing-apply-overview-text">
          <p>{t("a4Overview.p1")}</p>
          <p>{renderInlineMarkup(t("a4Overview.p2", { href: getDocumentChecklistPath() }))}</p>
          <p>{t("a4Overview.p3")}</p>
          <p>{t("a4Overview.p4")}</p>
          <p>{t("a4Overview.warning")}</p>
        </div>
      </CardSection>
      <CardSection className="listing-apply-overview-footer">
        <Button variant="primary" onClick={handleNextStep}>
          {t("t.next")}
        </Button>
      </CardSection>
    </div>
  )
}

export default ListingApplyOverview
