import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button, Heading, Card } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import stepStyles from "./ListingApplyStepWrapper.module.scss"

const ListingApplyHouseholdOverview = () => {
  const formEngineContext = useFormEngineContext()
  const { handleNextStep, handlePrevStep } = formEngineContext

  return (
    <>
      <Card.Section>
        <Button variant="text" onClick={handlePrevStep}>
          {t("t.back")}
        </Button>
      </Card.Section>
      <Card.Header>
        <Heading className={stepStyles["step-title"]} priority={1} size="2xl">
          {t("c1aHouseholdOverview.title1")}
        </Heading>
        <Heading className={stepStyles["step-title"]} priority={1} size="2xl">
          {t("c1aHouseholdOverview.title2")}
        </Heading>
      </Card.Header>
      <Card.Footer className={stepStyles["step-footer"]}>
        <Button variant="primary" onClick={() => handleNextStep()}>
          {t("t.next")}
        </Button>
      </Card.Footer>
    </>
  )
}

export default ListingApplyHouseholdOverview
