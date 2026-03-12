import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../../formEngine/formEngineContext"
import { getPrimaryApplicantData, getFullName } from "../../../../util/formEngineUtil"
import stepStyles from "../ListingApplyStepWrapper.module.scss"
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
  const { handleNextStep, formData, jumpToStep, setCurrentMemberIndex } = formEngineContext
  const primaryApplicant = getPrimaryApplicantData(formData)
  const householdMembers = formData["household-member-form"] as Array<Record<string, unknown>>
  return (
    <Card>
      <Card.Header divider="inset">
        <Heading size="2xl" priority={1} className={stepStyles["step-title"]}>
          {t("c2HouseholdMembers.title")}
        </Heading>
      </Card.Header>
      {/* Primary applicant is visible from start */}
      <HouseholdMember
        name={getFullName(primaryApplicant)}
        isPrimary={true}
        index={0}
        onEdit={() => jumpToStep("name")}
      />
      {householdMembers.map((member, index) => (
        <HouseholdMember
          key={index}
          name={getFullName({
            firstName: member.householdMemberFirstName as string,
            middleName: member.householdMemberMiddleName as string,
            lastName: member.householdMemberLastName as string,
          })}
          isPrimary={false}
          index={index}
          onEdit={(memberIndex) => {
            setCurrentMemberIndex(memberIndex + 1)
            jumpToStep("household-member-form")
          }}
        />
      ))}

      <Card.Section className={styles["add-member"]}>
        <Button variant="primary-outlined" onClick={() => handleNextStep(formData)}>
          {"+ " + t("label.addHouseholdMember")}
        </Button>
      </Card.Section>
      <Card.Section className={stepStyles["step-footer"]}>
        <Button onClick={() => jumpToStep("household-public-housing")}>
          {t("label.doneAddingPeople")}
        </Button>
      </Card.Section>
    </Card>
  )
}

export default AddHouseholdMembers
