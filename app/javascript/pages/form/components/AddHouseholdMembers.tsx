import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import { getPrimaryApplicantData } from "../../../util/formEngineUtil"
import stepStyles from "./ListingApplyStepWrapper.module.scss"
import styles from "./AddHouseholdMembers.module.scss"

const HouseholdMember = ({ name }: { name: string }) => {
  return (
    <Card.Section divider="inset" className={styles["household-member"]}>
      <div className={styles["household-member-info"]}>
        <Heading priority={2} size="md">
          {name}
        </Heading>
        <p className="field-note">{t("label.primaryUser")}</p>
      </div>
      <Button variant="text" className={styles["household-member-edit"]}>
        {t("t.edit")}
      </Button>
    </Card.Section>
  )
}

const AddHouseholdMembers = () => {
  const formEngineContext = useFormEngineContext()
  const { handleNextStep, formData } = formEngineContext
  const primaryApplicant = getPrimaryApplicantData(formData)
  console.log("formData", formData)

  return (
    <Card>
      <Card.Header divider="inset">
        <Heading size="2xl" priority={1} className={stepStyles["step-title"]}>
          {t("c2HouseholdMembers.title")}
        </Heading>
      </Card.Header>
      <HouseholdMember name={primaryApplicant.fullName} />
      <Card.Section className={styles["add-member"]}>
        <Button variant="primary-outlined" onClick={() => handleNextStep(formData)}>
          {"+ " + t("label.addHouseholdMember")}
        </Button>
      </Card.Section>
      <Card.Section className={stepStyles["step-footer"]}>
        <Button onClick={() => handleNextStep()}>{t("label.doneAddingPeople")}</Button>
      </Card.Section>
    </Card>
  )
}

export default AddHouseholdMembers
