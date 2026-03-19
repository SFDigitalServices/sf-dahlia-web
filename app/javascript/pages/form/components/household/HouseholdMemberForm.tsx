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
  methods,
  isEditing,
}: {
  handleUpdateHouseholdMember: (member: Record<string, string>) => void
  handleDeleteHouseholdMember: () => void
  methods: UseFormMethods<Record<string, unknown>>
  isEditing: boolean
}) => {
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
          label={t("label.householdMemberName")}
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
          label={t("label.dob")}
          ageErrorMessage={"TODO: error"}
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
      <Card.Section divider="inset">
        <YesNoRadio
          label={t("label.memberWorkInSf")}
          note={t("c3HouseholdMemberForm.workInSfDesc")}
          yesText={t("b2Contact.claimWorkInSf")}
          fieldNames={{
            question: "workInSf",
          }}
        />
      </Card.Section>
      <Card.Section>
        <Select
          label={t("label.householdMemberRelationship")}
          errorMessage={t("error.householdMemberRelationship")}
          defaultOptionName={t("label.selectOne")}
          options={[
            {
              name: t("label.spouse"),
              value: "spouse",
            },
            {
              name: t("label.registeredDomesticPartner"),
              value: "Registered Domestic Partner",
            },
          ]}
          fieldNames={{ selection: "relation" }}
        />
      </Card.Section>
      <Card.Footer className={stepStyles["step-footer"]}>
        <Button
          onClick={() => handleUpdateHouseholdMember(methods.getValues() as Record<string, string>)}
        >
          {isEditing ? t("label.householdMemberUpdate") : t("label.householdMemberSave")}
        </Button>
      </Card.Footer>
      {isEditing && (
        <Card.Section className={stepStyles["step-delete-member-subfooter"]}>
          <button onClick={handleDeleteHouseholdMember}>Delete this person</button>
        </Card.Section>
      )}
    </Card>
  )
}

export default HouseholdMemberForm
