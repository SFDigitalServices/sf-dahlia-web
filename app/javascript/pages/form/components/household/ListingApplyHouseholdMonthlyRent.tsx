/* eslint-disable @typescript-eslint/unbound-method */
import React, { useEffect, useMemo } from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { Heading } from "@bloom-housing/ui-seeds"
import { useFormEngineContext } from "../../../../formEngine/formEngineContext"
import { useFormContext, useWatch } from "react-hook-form"
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
  address: string
  householdMonthlyRent: string
  doesNotPayRent: string
  members: string[]
}

type ListingApplyHouseholdMonthlyRent = {
  title: string
  description: string
}

const formatMembers = (members: string[]) => {
  if (members.length === 1) return members[0]
  if (members.length === 2) return `${members[0]} and ${members[1]}`
  return `${members.slice(0, -1).join(", ")}, and ${members[members.length - 1]}`
}

const RentField = ({
  groupedAddress,
  isPrimaryApplicant,
}: {
  groupedAddress: GroupedAddress
  isPrimaryApplicant: boolean
}) => {
  const { setValue, register } = useFormContext()
  const doesNotPayRent = useWatch({ name: groupedAddress.doesNotPayRent })

  useEffect(() => {
    if (doesNotPayRent) {
      setValue(groupedAddress.householdMonthlyRent, "")
    }
  }, [doesNotPayRent, groupedAddress.householdMonthlyRent, setValue])

  const getLabel = () => {
    if (groupedAddress.members.length === 0) {
      return t("c5HouseholdMonthlyRent.howMuchDoYouPay", { address: groupedAddress.address })
    }
    if (isPrimaryApplicant && groupedAddress.members.length > 0) {
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
        fieldNames={{ amount: groupedAddress.householdMonthlyRent }}
        required={!doesNotPayRent}
        disabled={!!doesNotPayRent}
      />
      <Field
        type="checkbox"
        name={groupedAddress.doesNotPayRent}
        label={t("label.noRentPaid")}
        register={register}
      />
    </>
  )
}
const ListingApplyHouseholdMonthlyRent = ({
  title,
  description,
}: ListingApplyHouseholdMonthlyRent) => {
  const { formData, staticData } = useFormEngineContext()
  const { setValue } = useFormContext()

  const primaryAddress = getAddress(
    formData.primaryApplicantAddressStreet as string,
    formData.primaryApplicantAddressCity as string,
    formData.primaryApplicantAddressState as string,
    formData.primaryApplicantAddressZipcode as string,
    formData.primaryApplicantAddressAptOrUnit as string
  )

  const addresses = useMemo<GroupedAddress[]>(() => {
    const householdMembers = (formData.householdMembers as HouseholdMember[]) ?? []
    const result: GroupedAddress[] = [
      {
        address: primaryAddress,
        householdMonthlyRent: "groupedHouseholdAddresses[0].monthlyRent",
        doesNotPayRent: "groupedHouseholdAddresses[0].dontPayRent",
        members: [],
      },
    ]

    householdMembers.forEach((member) => {
      if (member.hasSameAddressAsApplicant === "true") {
        result[0].members.push(member.firstName)
      } else {
        const memberAddress = getAddress(
          member.householdMemberAddressStreet ?? "",
          member.householdMemberAddressCity ?? "",
          member.householdMemberAddressState ?? "",
          member.householdMemberAddressZipcode ?? "",
          member.householdMemberAddressAptOrUnit ?? ""
        )
        const hasExistingAddress = result.find((a) => a.address === memberAddress)
        if (hasExistingAddress) {
          hasExistingAddress.members.push(member.firstName)
        } else {
          const index = result.length
          result.push({
            address: memberAddress,
            householdMonthlyRent: `groupedHouseholdAddresses[${index}].monthlyRent`,
            doesNotPayRent: `groupedHouseholdAddresses[${index}].dontPayRent`,
            members: [member.firstName],
          })
        }
      }
    })

    return result
  }, [formData.householdMembers, primaryAddress])

  useEffect(() => {
    addresses.forEach((groupedAddress, index) => {
      setValue(`groupedHouseholdAddresses[${index}].address`, groupedAddress.address)
      setValue(`groupedHouseholdAddresses[${index}].members`, groupedAddress.members)
    })
  }, [addresses, setValue])

  return (
    <>
      <Heading className={stepStyles["step-title"]} priority={1} size="2xl">
        {translationFromDataSchema(title, {}, staticData, formData)}
      </Heading>
      {description && <p className="field-note text-base">{t(description)}</p>}

      {addresses.map((groupedAddress, index) => (
        <RentField key={index} groupedAddress={groupedAddress} isPrimaryApplicant={index === 0} />
      ))}
    </>
  )
}

export default ListingApplyHouseholdMonthlyRent
