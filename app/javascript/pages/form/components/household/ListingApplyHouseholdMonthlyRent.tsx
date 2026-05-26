import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { Heading } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../../formEngine/formEngineContext"
import { useForm, FormProvider } from "react-hook-form"
import stepStyles from "../ListingApplyStepWrapper.module.scss"
import { getAddress, translationFromDataSchema } from "../../../../util/formEngineUtil"
import Currency from "../Currency"

type HouseholdMember = {
  firstName: string
  lastName: string
  hasSameAddressAsApplicant: string
  householdMemberAddressStreet?: string
  householdMemberAddressAptOrUnit?: string
  householdMemberAddressCity?: string
  householdMemberAddressState?: string
  householdMemberAddressZipcode?: string
  id: string
}

type GroupedAddress = {
  primaryUser: boolean
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
const formatMembers = (members: string[]) => {
  if (members.length === 1) return members[0]
  if (members.length === 2) return `${members[0]} and ${members[1]}`
  return `${members.slice(0, -1).join(", ")}, and ${members[members.length - 1]}`
}

const RentField = ({ groupedAddress }: { groupedAddress: GroupedAddress }) => {
  const getLabel = () => {
    if (groupedAddress.members.length === 0) {
      return t("c5HouseholdMonthlyRent.howMuchDoYouPay", { address: groupedAddress.address })
    }
    if (groupedAddress.primaryUser && groupedAddress.members.length > 0) {
      return t("c5HouseholdMonthlyRent.howMuchDoYouAndMembersPay", {
        address: groupedAddress.address,
        members: formatMembers(["You", ...groupedAddress.members]),
      })
    }
    if (groupedAddress.members.length === 1) {
      return t("c5HouseholdMonthlyRent.howMuchDoesMemberPay", {
        address: groupedAddress.address,
        member: groupedAddress.members[0],
      })
    }
    return t("c5HouseholdMonthlyRent.howMuchDoMembersPay", {
      address: groupedAddress.address,
      members: formatMembers(groupedAddress.members),
    })
  }

  return (
    <>
      <Currency
        label={getLabel()}
        errorMessage={"error.pleasePutInARent"}
        fieldNames={{ amount: groupedAddress.monthlyRent }}
      />
      <Field type="checkbox" name={groupedAddress.doesNotPayRent} label={t("label.noRentPaid")} />
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

  const primaryAddress = getAddress(
    formData.primaryApplicantAddressStreet as string,
    formData.primaryApplicantAddressCity as string,
    formData.primaryApplicantAddressState as string,
    formData.primaryApplicantAddressZipcode as string,
    formData.primaryApplicantAddressAptOrUnit as string
  )

  const addresses: GroupedAddress[] = [
    {
      primaryUser: true,
      address: primaryAddress,
      monthlyRent: "0",
      doesNotPayRent: "false",
      members: [],
    },
  ]

  const householdMembers = (formData.householdMembers as HouseholdMember[]) ?? []
  householdMembers.forEach((member) => {
    if (member.hasSameAddressAsApplicant === "true") {
      addresses[0].members.push(member.firstName)
    } else {
      const memberAddress = getAddress(
        member.householdMemberAddressStreet ?? "",
        member.householdMemberAddressCity ?? "",
        member.householdMemberAddressState ?? "",
        member.householdMemberAddressZipcode ?? "",
        member.householdMemberAddressAptOrUnit ?? ""
      )

      // Checks if two household members share the same non-primary address
      const hasExistingAddress = addresses.find((a) => a.address === memberAddress)
      if (hasExistingAddress) {
        hasExistingAddress.members.push(member.firstName)
      } else {
        addresses.push({
          primaryUser: false,
          address: memberAddress,
          monthlyRent: "0",
          doesNotPayRent: "false",
          members: [member.firstName],
        })
      }
    }
  })

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
