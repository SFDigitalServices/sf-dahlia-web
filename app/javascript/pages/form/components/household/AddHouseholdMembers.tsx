import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../../formEngine/formEngineContext"
import { getPrimaryApplicantData } from "../../../../util/listingApplyUtil"
import { getFullName } from "../../../../util/formEngineUtil"
import stepStyles from "../ListingApplyStepWrapper.module.scss"
import styles from "./AddHouseholdMembers.module.scss"

interface AddHouseholdMemberProps {
  householdMembers: Record<string, unknown>[]
  handleAddHouseholdMember: () => void
  handleEditHouseholdMember: (index: number) => void
  handleSubmitHouseholdMembers: () => void
}

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
const AddHouseholdMembers = ({
  householdMembers,
  handleAddHouseholdMember,
  handleEditHouseholdMember,
  handleSubmitHouseholdMembers,
}: AddHouseholdMemberProps) => {
  const { jumpToStep, formData } = useFormEngineContext()
  const primaryApplicant = getPrimaryApplicantData(formData)
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
            firstName: member.firstName as string,
            middleName: member.middleName as string,
            lastName: member.lastName as string,
          })}
          isPrimary={false}
          index={index}
          onEdit={handleEditHouseholdMember}
        />
      ))}
      <Card.Section className={styles["add-member"]}>
        <Button variant="primary-outlined" onClick={handleAddHouseholdMember}>
          {"+ " + t("label.addHouseholdMember")}
        </Button>
      </Card.Section>
      <Card.Section className={stepStyles["step-footer"]}>
        <Button onClick={handleSubmitHouseholdMembers}>{t("label.doneAddingPeople")}</Button>
      </Card.Section>
    </Card>
  )
}

export default AddHouseholdMembers
