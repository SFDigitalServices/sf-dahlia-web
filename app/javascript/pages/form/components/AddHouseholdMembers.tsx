import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import { getPrimaryApplicantData } from "../../../util/formEngineUtil"
import stepStyles from "./ListingApplyStepWrapper.module.scss"
import styles from "./AddHouseholdMembers.module.scss"

const HouseholdMember = ({
  name,
  isPrimary = false,
  index,
  onEdit,
}: {
  name: string
  isPrimary?: boolean
  index: number
  onEdit: (index: number) => void
}) => {
  return (
    <Card.Section divider="inset" className={styles["household-member"]}>
      <div className={styles["household-member-info"]}>
        <Heading priority={2} size="md">
          {name}
        </Heading>
        <p className="field-note">
          {isPrimary ? t("label.primaryUser") : t("label.householdMember")}
        </p>
      </div>
      <Button
        variant="text"
        className={styles["household-member-edit"]}
        onClick={() => onEdit(index)}
      >
        {t("t.edit")}
      </Button>
    </Card.Section>
  )
}

const AddHouseholdMembers = () => {
  const formEngineContext = useFormEngineContext()
  const {
    handleNextStep,
    formData,
    jumpToStep,
    stepInfoMap,
    setCurrentMemberIndex,
    currentMemberIndex,
  } = formEngineContext
  const primaryApplicant = getPrimaryApplicantData(formData)
  const householdMembers = formData["household-member-form"] as Array<Record<string, unknown>>
  const getHouseholdMemberName = (member: Record<string, unknown>) => {
    const firstName = member.householdMemberFirstName as string
    const middleName = member.householdMemberMiddleName as string
    const lastName = member.householdMemberLastName as string
    return `${firstName} ${middleName} ${lastName}`
  }

  const handleEdit = (index: number) => {
    const householdMemberStepIndex = stepInfoMap.findIndex(
      (step) => step.slug === "household-member-form"
    )
    if (householdMemberStepIndex !== -1) {
      jumpToStep(householdMemberStepIndex, index - 1)
    }
  }

  return (
    <Card>
      <Card.Header divider="inset">
        <Heading size="2xl" priority={1} className={stepStyles["step-title"]}>
          {t("c2HouseholdMembers.title")}
        </Heading>
      </Card.Header>
      {/* Primary applicant is visible from start */}
      <HouseholdMember
        name={primaryApplicant.fullName}
        isPrimary={true}
        index={0}
        onEdit={() => handleEdit(0)}
      />
      {householdMembers.map((member, index) => (
        <HouseholdMember
          key={index}
          name={getHouseholdMemberName(member)}
          isPrimary={false}
          index={index}
          onEdit={() => handleEdit(index)}
        />
      ))}

      <Card.Section className={styles["add-member"]}>
        <Button
          variant="primary-outlined"
          onClick={() => {
            setCurrentMemberIndex(currentMemberIndex + 1)
            handleNextStep(formData)
          }}
        >
          {"+ " + t("label.addHouseholdMember")}
        </Button>
      </Card.Section>
      <Card.Section className={stepStyles["step-footer"]}>
        <Button onClick={() => handleNextStep(formData)}>{t("label.doneAddingPeople")}</Button>
      </Card.Section>
    </Card>
  )
}

export default AddHouseholdMembers
