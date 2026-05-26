/* eslint-disable @typescript-eslint/unbound-method */
import { Field, t } from "@bloom-housing/ui-components"
import React, { useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form/dist/index.ie11"
import Currency from "../Currency"
import { GroupedAddress } from "./ListingApplyHouseholdMonthlyRentStep"

const formatMembers = (members: { firstName: string; fullName: string }[]) => {
  const names = members.map((member) => member.firstName)

  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`
}

const ListingApplyHouseholdMonthlyRent = ({
  groupedAddress,
  isPrimaryApplicant,
}: {
  key: string
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
        members: formatMembers([...groupedAddress.members]),
      })
    }
    if (groupedAddress.members.length === 1) {
      return t("c5HouseholdMonthlyRent.howMuchDoesMemberPay", {
        address: groupedAddress.address,
        member: groupedAddress.members[0].firstName,
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

export default ListingApplyHouseholdMonthlyRent
