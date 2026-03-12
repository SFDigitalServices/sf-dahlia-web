import React, { useState } from "react"
import { t } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../../formEngine/formEngineContext"
import {
  getPrimaryApplicantData,
  getFullName,
  updateFormPath,
} from "../../../../util/formEngineUtil"
import stepStyles from "../ListingApplyStepWrapper.module.scss"
import styles from "./AddHouseholdMembers.module.scss"
import HouseholdMemberStepWrapper from "./HouseholdMemberStepWrapper"
import formSchema from "../../../../formEngine/listingApplicationDefaultRental.json"
import RecursiveRenderer from "../../../../formEngine/recursiveRenderer"
import getFormComponentRegistry from "../../../../formEngine/formComponentRegistry"

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
  const { formData, jumpToStep, currentStepIndex, stepInfoMap, saveFormData } = formEngineContext
  const primaryApplicant = getPrimaryApplicantData(formData)
  const [currentMemberIndex, setCurrentMemberIndex] = useState<number>(0)
  const [addMember, setAddMember] = useState<boolean>(false)

  const householdMemberFormSchema = formSchema.children?.find(
    (child) => child.stepInfo?.slug === "household-member-form"
  )

  const createEmptyHouseholdMember = (): Record<string, unknown> => {
    const newHouseholdMember = {}
    householdMemberFormSchema.children.forEach((child) => {
      Object.keys(child.props.fieldNames as Record<string, string>).forEach((key) => {
        newHouseholdMember[child.props.fieldNames[key]] = null
      })
    })
    return newHouseholdMember
  }

  const [householdMembers, setHouseholdMembers] = useState<Record<string, unknown>[]>([])

  const updateHouseholdMember = (data: Record<string, unknown>) => {
    const updatedHouseholdMembers = [...householdMembers]
    updatedHouseholdMembers[currentMemberIndex] = data
    setHouseholdMembers(updatedHouseholdMembers)
  }

  console.log("householdMembers", householdMembers)
  console.log("currentMemberIndex", currentMemberIndex)
  console.log("addMember", addMember)

  const componentRegistry = getFormComponentRegistry()
  if (addMember) {
    return (
      <HouseholdMemberStepWrapper
        title={householdMemberFormSchema.props?.title}
        description={householdMemberFormSchema.props?.description}
        setAddMember={setAddMember}
        householdMember={householdMembers[currentMemberIndex]}
        updateHouseholdMember={updateHouseholdMember}
      >
        {householdMemberFormSchema.children?.map((child, index) => (
          <RecursiveRenderer key={index} schema={child} componentRegistry={componentRegistry} />
        ))}
      </HouseholdMemberStepWrapper>
    )
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
          onEdit={(index) => {
            setAddMember(true)
            setCurrentMemberIndex(index)
            updateFormPath(currentStepIndex + 1, stepInfoMap)
          }}
        />
      ))}
      <Card.Section className={styles["add-member"]}>
        <Button
          variant="primary-outlined"
          onClick={() => {
            const newHouseholdMember = createEmptyHouseholdMember()
            setHouseholdMembers([...householdMembers, newHouseholdMember])
            setCurrentMemberIndex(householdMembers.length)
            setAddMember(true)
          }}
        >
          {"+ " + t("label.addHouseholdMember")}
        </Button>
      </Card.Section>
      <Card.Section className={stepStyles["step-footer"]}>
        <Button
          onClick={() => {
            saveFormData({ "household-member-form": householdMembers })
            jumpToStep("household-public-housing")
          }}
        >
          {t("label.doneAddingPeople")}
        </Button>
      </Card.Section>
    </Card>
  )
}

export default AddHouseholdMembers
