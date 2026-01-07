import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button, Heading } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import styles from "./ListingApplyPreferencesIntro.module.scss"

const ListingApplyPreferencesIntro = () => {
  const formEngineContext = useFormEngineContext()
  const { handleNextStep, handlePrevStep } = formEngineContext

  return (
    <>
      <CardSection>
        <Button variant="text" onClick={handlePrevStep}>
          {t("t.back")}
        </Button>
      </CardSection>
      <div className={styles["listing-apply-preferences-intro"]}>
        <CardSection divider="inset">
          <Heading priority={2} size="2xl">
            {t("e1PreferencesIntro.title")}
          </Heading>
        </CardSection>
        <CardSection className={styles["listing-apply-preferences-steps"]}>
          <Heading priority={3} size="lg">
            {t("e1PreferencesIntro.stepsTitle")}
          </Heading>
          <ol>
            <li>{t("e1PreferencesIntro.step1")}</li>
            <li>{t("e1PreferencesIntro.step2")}</li>
            <li>{t("e1PreferencesIntro.step3")}</li>
          </ol>
        </CardSection>
        <CardSection className={styles["listing-apply-preferences-footer"]}>
          <Button variant="primary" onClick={handleNextStep}>
            {t("t.getStarted")}
          </Button>
        </CardSection>
      </div>
    </>
  )
}

export default ListingApplyPreferencesIntro
