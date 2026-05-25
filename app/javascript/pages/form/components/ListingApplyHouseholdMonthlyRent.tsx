import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { Heading } from "@bloom-housing/ui-seeds"
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

type ListingApplyHouseholdMonthlyRent = {
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

const ListingApplyHouseholdMonthlyRent = ({
  title,
  description,
}: ListingApplyHouseholdMonthlyRent) => {
  const { formData, staticData } = useFormEngineContext()

  const methods = useForm({
    mode: "onChange",
    shouldFocusError: false,
  })
  //   const groupedAddressesArray: GroupedAddress[] = []
  const primaryAddress = getAddress(
    formData.primaryApplicantAddressStreet as string,
    formData.primaryApplicantAddressCity as string,
    formData.primaryApplicantAddressState as string,
    formData.primaryApplicantAddressZipcode as string,
    formData.primaryApplicantAddressAptOrUnit as string
  )
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
      <>
        <Heading className={stepStyles["step-title"]} priority={1} size="2xl">
          {translationFromDataSchema(title, {}, staticData, formData)}
        </Heading>
        {description && <p className="field-note text-base">{t(description)}</p>}

        {addresses.map((groupedAddress: GroupedAddress, index: number) => (
          <RentField key={index} groupedAddress={groupedAddress} />
        ))}
      </>
    </FormProvider>
  )
}

export default ListingApplyHouseholdMonthlyRent
