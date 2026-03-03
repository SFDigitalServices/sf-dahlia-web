import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button, Heading, Card } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import styles from "./ListingApplyHouseholdIntro.module.scss"
import stepStyles from "./ListingApplyStepWrapper.module.scss"

const ListingApplyHouseholdIntro = () => {
  const formEngineContext = useFormEngineContext()
  const { handleNextStep, handlePrevStep } = formEngineContext

  return (
    <>
      <Card.Section>
        <Button variant="text" onClick={handlePrevStep}>
          {t("t.back")}
        </Button>
      </Card.Section>
      <Card.Header divider="inset">
        <Heading className={stepStyles["step-title"]} priority={1} size="2xl">
          {t("c1HouseholdIntro.title")}
        </Heading>
      </Card.Header>
      <Card.Section className={styles["household-intro"]}>
        <Button variant="primary-outlined" onClick={handlePrevStep}>
          {t("label.liveAlone")}
        </Button>
        <Button variant="primary-outlined" onClick={handlePrevStep}>
          {t("label.otherPeople")}
        </Button>
      </Card.Section>
      <Card.Footer className={stepStyles["step-footer"]}>
        <Button variant="primary" onClick={() => handleNextStep()}>
          {t("t.next")}
        </Button>
      </Card.Footer>
    </>
  )
}

export default ListingApplyHouseholdIntro
