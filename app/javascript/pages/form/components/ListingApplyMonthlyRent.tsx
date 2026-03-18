import { t } from "@bloom-housing/ui-components"
import { Button, Heading, Card } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import stepStyles from "./ListingApplyStepWrapper.module.scss"
import {
  getAddress,
  getFullName,
  getPrimaryApplicantData,
  translationFromDataSchema,
} from "../../../util/formEngineUtil"
import React from "react"

type GroupedAddress = {
  address: string
  monthlyRent: string
  doesNotPayRent: boolean
  members: Array<{ name: string }>
}

type ListingApplyMonthlyRentProps = {
  title: string
  householdTitle?: string
  description: string
  fieldNames: {
    groupedAddresses: string
  }
}

const RentFieldGroup = ({ groupedAddress }: { groupedAddress: GroupedAddress }) => {
  return (
    <>
      <p>{groupedAddress.address}</p>
      <p>{groupedAddress.monthlyRent}</p>
      <p>{groupedAddress.doesNotPayRent}</p>
      <p>{groupedAddress.members.map((member) => member.name).join(", ")}</p>
    </>
  )
}

const ListingApplyMonthlyRent = ({
  title,
  description,
  fieldNames,
  householdTitle,
}: ListingApplyMonthlyRentProps) => {
  const { formData, saveFormData, handleNextStep, handlePrevStep } = useFormEngineContext()
  const groupedAddressesArray: GroupedAddress[] = []
  const primaryAddress = getAddress(
    formData.primaryApplicantAddressStreet as string,
    formData.primaryApplicantAddressCity as string,
    formData.primaryApplicantAddressState as string,
    formData.primaryApplicantAddressZipcode as string,
    formData.primaryApplicantAddressAptOrUnit as string
  )
  //TODO: DAH-3577 to group all household member addresses
  const addresses: GroupedAddress[] = [
    {
      address: primaryAddress,
      monthlyRent: null,
      doesNotPayRent: null,
      members: [
        {
          name: getFullName(getPrimaryApplicantData(formData)),
        },
      ],
    },
  ]
  return (
    <>
      <Card.Section>
        <Button variant="text" onClick={handlePrevStep}>
          {t("t.back")}
        </Button>
      </Card.Section>
      <Card.Header divider="inset">
        <Heading className={stepStyles["step-title"]} priority={1} size="2xl">
          {translationFromDataSchema(title, {}, useFormEngineContext().dataSources, householdTitle)}
        </Heading>
        {description && <p className="field-note text-base">{t(description)}</p>}
      </Card.Header>
      <Card.Section>
        {addresses.map((groupedAddress: GroupedAddress, index: number) => (
          <RentFieldGroup key={index} groupedAddress={groupedAddress} />
        ))}
      </Card.Section>
      <Card.Footer className={stepStyles["step-footer"]}>
        <Button
          variant="primary"
          onClick={() => {
            saveFormData({ [fieldNames.groupedAddresses]: groupedAddressesArray })
            handleNextStep({
              ...formData,
              [fieldNames.groupedAddresses]: groupedAddressesArray,
            })
          }}
        >
          {t("t.next")}
        </Button>
      </Card.Footer>
    </>
  )
}

export default ListingApplyMonthlyRent
