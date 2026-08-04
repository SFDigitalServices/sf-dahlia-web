import React, { useEffect, useRef } from "react"
import stepStyles from "../ListingApplyStepWrapper.module.scss"
import { Button, Card, Heading, LoadingState } from "@bloom-housing/ui-seeds"
import { t } from "@bloom-housing/ui-components"
import Name from "../Name"
import { UseFormMethods } from "react-hook-form"
import DateOfBirth from "../DateOfBirth"
import HouseholdMemberSameAddress from "./HouseholdMemberSameAddress"
import YesNoRadio from "../YesNoRadio"
import Select from "../Select"
import styles from "./HouseholdMemberForm.module.scss"
import { RELATIONSHIP_OPTIONS } from "../../../../modules/constants"
import ListingApplyStepErrorMessage from "../ListingApplyStepErrorMessage"

const HouseholdMemberForm = ({
  loading,
  addressError,
  handleUpdateHouseholdMember,
  handleDeleteHouseholdMember,
  handleCancelAddHouseholdMember,
  onSetSectionCompletion,
  onRemoveApiErrorMessage,
  formMethods,
  isEditing,
}: {
  loading: boolean
  addressError: string | null
  handleUpdateHouseholdMember: (data: Record<string, string>) => void | Promise<void>
  handleDeleteHouseholdMember: () => void
  handleCancelAddHouseholdMember: () => void
  onSetSectionCompletion: (isComplete: boolean) => void
  onRemoveApiErrorMessage: () => void
  formMethods: UseFormMethods<Record<string, unknown>>
  isEditing: boolean
}) => {
  const errorSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (Object.keys(formMethods.formState.errors).length > 0 || addressError) {
      errorSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      onSetSectionCompletion(false)
    } else {
      onSetSectionCompletion(true)
    }
  }, [formMethods.formState.errors, addressError, onSetSectionCompletion])

  const onMemberSave = () => {
    void formMethods.handleSubmit(() =>
      handleUpdateHouseholdMember(formMethods.getValues() as Record<string, string>)
    )()
  }

  return (
    <Card>
      <Card.Header divider="inset">
        <Heading size="2xl" className={stepStyles["step-title"]}>
          {t("c3HouseholdMemberForm.title")}
        </Heading>
        <p className="field-note text-base">{t("c3HouseholdMemberForm.p1")}</p>
      </Card.Header>
      <div ref={errorSectionRef}>
        {(Object.keys(formMethods.formState.errors).length > 0 || addressError) && (
          <ListingApplyStepErrorMessage
            errorMessage={t("error.formSubmission")}
            onClose={() => {
              formMethods.clearErrors()
              onRemoveApiErrorMessage()
            }}
          />
        )}
      </div>
      <Card.Section divider="inset">
        <Name
          label={"label.householdMemberName"}
          showMiddleName={true}
          fieldNames={{
            firstName: "firstName",
            middleName: "middleName",
            lastName: "lastName",
          }}
        />
      </Card.Section>
      <Card.Section divider="inset">
        <DateOfBirth
          label={"label.dob"}
          ageErrorMessage={""}
          fieldNames={{
            birthMonth: "birthMonth",
            birthDay: "birthDay",
            birthYear: "birthYear",
          }}
        />
      </Card.Section>
      <Card.Section divider="inset">
        <LoadingState loading={loading}>
          <HouseholdMemberSameAddress addressError={addressError} />
        </LoadingState>
      </Card.Section>
      <Card.Section divider="inset" className={styles["household-member-radio"]}>
        <YesNoRadio
          label={"label.memberWorkInSf"}
          note={"c3HouseholdMemberForm.workInSfDesc"}
          yesText={"b2Contact.claimWorkInSf"}
          fieldNames={{
            question: "workInSf",
          }}
        />
      </Card.Section>
      <Card.Section>
        <Select
          label={"label.householdMemberRelationship"}
          errorMessage={"error.householdMemberRelationship"}
          defaultOptionName={"label.selectOne"}
          options={RELATIONSHIP_OPTIONS}
          fieldNames={{ selection: "relation" }}
        />
      </Card.Section>
      <Card.Footer className={stepStyles["step-footer"]}>
        <Button onClick={onMemberSave}>
          {isEditing ? t("label.householdMemberUpdate") : t("label.householdMemberSave")}
        </Button>
      </Card.Footer>
      <Card.Section className={stepStyles["step-delete-member-subfooter"]}>
        <button onClick={isEditing ? handleDeleteHouseholdMember : handleCancelAddHouseholdMember}>
          {isEditing ? t("label.householdMemberDelete") : t("label.householdMemberCancel")}
        </button>
      </Card.Section>
    </Card>
  )
}

export default HouseholdMemberForm
