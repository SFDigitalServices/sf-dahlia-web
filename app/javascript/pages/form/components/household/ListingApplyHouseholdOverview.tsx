import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button, Heading } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../../formEngine/formEngineContext"
import styles from "./ListingApplyHouseholdOverview.module.scss"

const ListingApplyHouseholdOverview = () => {
  const formEngineContext = useFormEngineContext()
  const { formData, handleNextStep, handlePrevStep } = formEngineContext
  return (
    <>
      <CardSection>
        <Button variant="text" onClick={handlePrevStep}>
          {t("t.back")}
        </Button>
      </CardSection>
      <CardSection>
        <Heading
          priority={2}
          size="2xl"
          className={styles["listing-apply-household-overview-body"]}
        >
          <span>{t("c1aHouseholdOverview.title1")}</span>
          <span>{t("c1aHouseholdOverview.title2")}</span>
        </Heading>{" "}
      </CardSection>
      <CardSection className={styles["listing-apply-household-overview-footer"]}>
        <Button variant="primary" onClick={() => handleNextStep(formData)}>
          {t("t.next")}
        </Button>
      </CardSection>
    </>
  )
}

export default ListingApplyHouseholdOverview
