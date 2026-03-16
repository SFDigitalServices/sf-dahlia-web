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
  multiStepFieldNames,
  handleUpdateHouseholdMember,
  methods,
}: {
  multiStepFieldNames: {
    firstName: string
    middleName: string
    lastName: string
    birthMonth: string
    birthDay: string
    birthYear: string
    address: string
    workInSf: string
    relation: string
  }
  handleUpdateHouseholdMember: (member: Record<string, string>) => void
  methods: UseFormMethods<Record<string, unknown>>
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
            firstName: multiStepFieldNames.firstName,
            middleName: multiStepFieldNames.middleName,
            lastName: multiStepFieldNames.lastName,
          }}
        />
      </Card.Section>
      <Card.Section divider="inset">
        <DateOfBirth
          label={t("label.dob")}
          ageErrorMessage={"TODO: error"}
          fieldNames={{
            birthMonth: multiStepFieldNames.birthMonth,
            birthDay: multiStepFieldNames.birthDay,
            birthYear: multiStepFieldNames.birthYear,
          }}
        />
      </Card.Section>
      <Card.Section divider="inset">
        <HouseholdMemberSameAddress label={t("label.memberSameAddress")} />
      </Card.Section>
      <Card.Section divider="inset">
        <YesNoRadio
          label={t("label.memberWorkInSf")}
          note={t("c3HouseholdMemberForm.workInSfDesc")}
          yesText={t("b2Contact.claimWorkInSf")}
          fieldNames={{
            question: multiStepFieldNames.workInSf,
          }}
        />
      </Card.Section>
      <Card.Section divider="inset">
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
          fieldName={multiStepFieldNames.relation}
        />
      </Card.Section>
      <Card.Footer className={stepStyles["step-footer"]}>
        <Button
          onClick={() => handleUpdateHouseholdMember(methods.getValues() as Record<string, string>)}
        >
          {t("label.householdMemberSave")}
        </Button>
      </Card.Footer>
    </Card>
  )
}

export default HouseholdMemberForm
