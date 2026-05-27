import React, { useMemo } from "react"
import { t, Form } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import { FormProvider, useForm } from "react-hook-form"
import stepStyles from "../ListingApplyStepWrapper.module.scss"
import { useFormEngineContext } from "../../../../formEngine/formEngineContext"
import { getPrimaryApplicantData } from "../../../../util/listingApplyUtil"
import { getAddress, translationFromDataSchema } from "../../../../util/formEngineUtil"
import ListingApplyHouseholdMonthlyRent from "./ListingApplyHouseholdMonthlyRent"

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

export type GroupedAddress = {
  address: string
  householdMonthlyRent: string
  doesNotPayRent: string
  members: { firstName: string; fullName: string }[]
}

type ListingApplyHouseholdMonthlyRent = {
  title: string
  description: string
}

const ListingApplyHouseholdMonthlyRentStep = ({
  title,
  description,
}: ListingApplyHouseholdMonthlyRent) => {
  const { staticData, formData, saveFormData, handleNextStep, handlePrevStep } =
    useFormEngineContext()
  const groupedAddresses = useMemo<GroupedAddress[]>(() => {
    const { firstName: primaryFirstName, lastName: primaryLastName } =
      getPrimaryApplicantData(formData)
    const householdMembers = (formData.householdMembers as HouseholdMember[]) ?? []
    const primaryAddress = getAddress(
      formData.primaryApplicantAddressStreet as string,
      formData.primaryApplicantAddressCity as string,
      formData.primaryApplicantAddressState as string,
      formData.primaryApplicantAddressZipcode as string,
      formData.primaryApplicantAddressAptOrUnit as string
    )
    const primaryApplicantAddress: GroupedAddress = {
      address: primaryAddress,
      householdMonthlyRent: "householdMonthlyRent",
      doesNotPayRent: "householdDoesNotPayRent",
      members: [
        {
          firstName: "You",
          fullName: `${primaryFirstName} ${primaryLastName}`,
        },
      ],
    }

    const householdAddresses: GroupedAddress[] = [primaryApplicantAddress]
    householdMembers.forEach((member) => {
      if (member.hasSameAddressAsApplicant === "true") {
        householdAddresses[0].members.push({
          firstName: member.firstName,
          fullName: `${member.firstName} ${member.lastName}`,
        })
      } else {
        const memberAddress = getAddress(
          member.householdMemberAddressStreet ?? "",
          member.householdMemberAddressCity ?? "",
          member.householdMemberAddressState ?? "",
          member.householdMemberAddressZipcode ?? "",
          member.householdMemberAddressAptOrUnit ?? ""
        )

        const hasExistingAddress = householdAddresses.find((a) => a.address === memberAddress)

        if (hasExistingAddress) {
          hasExistingAddress.members.push({
            firstName: member.firstName,
            fullName: `${member.firstName} ${member.lastName}`,
          })
        } else {
          householdAddresses.push({
            address: memberAddress,
            householdMonthlyRent: `householdMonthlyRent_${member.id}`,
            doesNotPayRent: `householdDoesNotPayRent_${member.id}`,
            members: [
              {
                firstName: member.firstName,
                fullName: `${member.firstName} ${member.lastName}`,
              },
            ],
          })
        }
      }
    })

    return householdAddresses
  }, [formData])

  const defaultValues = useMemo(() => {
    const defaultAddress: Record<string, unknown> = {}

    groupedAddresses.forEach((group) => {
      defaultAddress[group.householdMonthlyRent] = formData[group.householdMonthlyRent]
      defaultAddress[group.doesNotPayRent] = formData[group.doesNotPayRent]
    })

    return defaultAddress
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formMethods = useForm({
    mode: "onSubmit",
    shouldFocusError: false,
    defaultValues,
  })

  const onSubmit = (data: Record<string, unknown>) => {
    const groupedHouseholdAddresses = groupedAddresses.map((group) => ({
      address: group.address,
      monthlyRent: data[group.householdMonthlyRent],
      dontPayRent: data[group.doesNotPayRent],
      members: group.members,
    }))

    const groupedData = {
      ...data,
      groupedHouseholdAddresses,
    }

    saveFormData(groupedData)
    handleNextStep({
      ...formData,
      ...groupedData,
    })
  }

  return (
    <FormProvider {...formMethods}>
      <Card>
        <Card.Section>
          <Button variant="text" className={stepStyles["back-button"]} onClick={handlePrevStep}>
            {t("t.back")}
          </Button>
        </Card.Section>
        <Card.Header divider="inset">
          <Heading className={stepStyles["step-title"]} priority={1} size="2xl">
            {translationFromDataSchema(title, {}, staticData, formData)}
          </Heading>
          {description && <p className="field-note text-base">{t(description)}</p>}
        </Card.Header>
        <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Card.Section>
            {groupedAddresses.map((group, index) => (
              <ListingApplyHouseholdMonthlyRent
                key={group.address}
                groupedAddress={group}
                isPrimaryApplicant={index === 0}
              />
            ))}
          </Card.Section>

          <Card.Footer className={stepStyles["step-footer"]}>
            <Button variant="primary" type="submit">
              {t("t.next")}
            </Button>
          </Card.Footer>
        </Form>
      </Card>
    </FormProvider>
  )
}

export default ListingApplyHouseholdMonthlyRentStep
