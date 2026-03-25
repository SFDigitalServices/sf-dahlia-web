import React from "react"
import stepStyles from "../ListingApplyStepWrapper.module.scss"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import { t } from "@bloom-housing/ui-components"
import Name from "../Name"
import { UseFormMethods } from "react-hook-form"
import DateOfBirth from "../DateOfBirth"
import HouseholdMemberSameAddress from "./HouseholdMemberSameAddress"
import YesNoRadio from "../YesNoRadio"
import Select from "../Select"

const HouseholdMemberForm = ({
  handleUpdateHouseholdMember,
  handleDeleteHouseholdMember,
  handleCancelAddHouseholdMember,
  methods,
  isEditing,
}: {
  handleUpdateHouseholdMember: (member: Record<string, string>) => void
  handleDeleteHouseholdMember: () => void
  handleCancelAddHouseholdMember: () => void
  methods: UseFormMethods<Record<string, unknown>>
  isEditing: boolean
}) => {
  const onMemberSave = () => {
    void methods.handleSubmit(() =>
      handleUpdateHouseholdMember(methods.getValues() as Record<string, string>)
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
        <HouseholdMemberSameAddress />
      </Card.Section>
      <Card.Section divider="inset" className={stepStyles["step-household-member-radio"]}>
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
          options={[
            {
              name: "label.spouse",
              value: "spouse",
            },
            {
              name: "label.registeredDomesticPartner",
              value: "Registered Domestic Partner",
            },
          ]}
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
