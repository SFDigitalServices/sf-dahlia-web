import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { Button, Heading, Card } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import { useForm, FormProvider } from "react-hook-form"
import stepStyles from "./ListingApplyStepWrapper.module.scss"
import { getAddress, translationFromDataSchema } from "../../../util/formEngineUtil"

type GroupedAddress = {
  address: string
  monthlyRent: string
  doesNotPayRent: string
  members: string[]
}

type ListingApplyMonthlyRentProps = {
  title: string
  householdTitle?: string
  description: string
  fieldNames: {
    groupedAddresses: string
  }
}

const RentField = ({ groupedAddress }: { groupedAddress: GroupedAddress }) => {
  const getLabel = () => {
    if (groupedAddress.members.length === 0) {
      return t("c5HouseholdMonthlyRent.titleYou")
    }
    return groupedAddress.members.length === 1
      ? t("c5HouseholdMonthlyRent.howMuchDoYouPay", { address: groupedAddress.address })
      : t("c5HouseholdMonthlyRent.howMuchDoYouAndMembersPay", {
          address: groupedAddress.address,
          members: groupedAddress.members.join(", "),
        })
  }

  return (
    <>
      <legend className="legend-header">{getLabel()}</legend>
      <Field name={groupedAddress.monthlyRent} errorMessage={t("error.pleasePutInARent")} />
      <Field
        type="checkbox"
        name={groupedAddress.address + "_checkbox"}
        label={t("label.noRentPaid")}
      />
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
  const methods = useForm({
    mode: "onChange",
    shouldFocusError: false,
  })
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
      monthlyRent: "0",
      doesNotPayRent: "false",
      members: [],
    },
  ]

  return (
    <FormProvider {...methods}>
      <Card>
        <Card.Section>
          <Button variant="text" onClick={handlePrevStep}>
            {t("t.back")}
          </Button>
        </Card.Section>
        <Card.Header divider="inset">
          <Heading className={stepStyles["step-title"]} priority={1} size="2xl">
            {translationFromDataSchema(
              title,
              {},
              useFormEngineContext().dataSources,
              householdTitle
            )}
          </Heading>
          {description && <p className="field-note text-base">{t(description)}</p>}
        </Card.Header>
        <Card.Section>
          {addresses.map((groupedAddress: GroupedAddress, index: number) => (
            <RentField key={index} groupedAddress={groupedAddress} />
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
      </Card>
    </FormProvider>
  )
}

export default ListingApplyMonthlyRent
