import React, { useState } from "react"
import { nanoid } from "nanoid"
import { useForm, FormProvider } from "react-hook-form"
import { useFormEngineContext } from "../../../../formEngine/formEngineContext"
import HouseholdMemberForm from "./HouseholdMemberForm"
import AddHouseholdMembers from "./AddHouseholdMembers"
import VerifyAddress from "../VerifyAddress"
import {
  checkNeighborhoodPreferenceMatch,
  locateVerifiedAddress,
  type Address,
} from "../../../../api/formApiService"
import { addressesMatch, getAddressErrorEmailLink } from "../../../../util/formEngineUtil"
import { t } from "@bloom-housing/ui-components"
import { getLiveWorkInSfMembers, liveInTheNeighborhoodHouseholdMembers } from "./householdUtils"
import { formatApplicantDOB } from "../../../../util/listingApplyUtil"

interface HouseholdMemberMultiStepWrapperProps {
  fieldNames: {
    householdMembers: string
    showLiveWorkInSfPrefStep: string
    showNRHPPrefStep: string
  }
}
const householdMemberFields = {
  firstName: "householdMemberFirstName",
  middleName: "householdMemberMiddleName",
  lastName: "householdMemberLastName",
  birthMonth: "householdMemberBirthMonth",
  birthDay: "householdMemberBirthDay",
  birthYear: "householdMemberBirthYear",
  street1: "householdMemberAddressStreet",
  street2: "householdMemberAddressAptOrUnit",
  city: "householdMemberAddressCity",
  state: "householdMemberAddressState",
  zip: "householdMemberAddressZipcode",
  sameAddressAsApplicant: "hasSameAddressAsApplicant",
  addressVerified: "householdMemberAddressVerified",
  neighborhoodPreferenceAddressMatch: "neighborhoodPreferenceAddressMatch",
}

type multiStepComponents =
  | "AddHouseholdMembers"
  | "HouseholdMemberForm"
  | "HouseholdMemberVerifyAddress"

const HouseholdMemberMultiStepWrapper = ({
  fieldNames: { householdMembers, showLiveWorkInSfPrefStep, showNRHPPrefStep },
}: HouseholdMemberMultiStepWrapperProps) => {
  const { saveFormData, formData, staticData, handleNextStep } = useFormEngineContext()
  const [currentMemberIndex, setCurrentMemberIndex] = useState<number>(0)
  const [componentToRender, setComponentToRender] =
    useState<multiStepComponents>("AddHouseholdMembers")
  const [isEditingHouseholdMember, setIsEditingHouseholdMember] = useState(false)
  const [pendingMember, setPendingMember] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null)

  const [householdMembersArray, setHouseholdMembersArray] = useState<Record<string, unknown>[]>(
    (formData[householdMembers] as Record<string, unknown>[]) || []
  )

  const methods = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
    defaultValues: householdMembersArray[currentMemberIndex],
  })

  const getHouseholdMemberAddress = (data: Record<string, unknown>): Address => ({
    street1: (data[householdMemberFields.street1] as string) ?? "",
    street2: (data[householdMemberFields.street2] as string) ?? "",
    city: (data[householdMemberFields.city] as string) ?? "",
    state: (data[householdMemberFields.state] as string) ?? "",
    zip: (data[householdMemberFields.zip] as string) ?? "",
  })

  // Checks address verification status and handles edge case where
  // address may be updated upon editing an existing household member
  const addressNeedsVerification = (data: Record<string, string>) => {
    if (data[householdMemberFields.sameAddressAsApplicant] === "true") return false

    const existingMember = householdMembersArray[currentMemberIndex]
    const isAlreadyVerified =
      isEditingHouseholdMember &&
      existingMember?.[householdMemberFields.addressVerified] === "true" &&
      addressesMatch(
        getHouseholdMemberAddress(data) as Record<string, string>,
        getHouseholdMemberAddress(existingMember) as Record<string, string>
      )
    return !isAlreadyVerified
  }

  const saveHouseholdMember = (data: Record<string, unknown>) => {
    const updated = [...householdMembersArray]
    if (isEditingHouseholdMember) {
      updated[currentMemberIndex] = {
        ...data,
        id: householdMembersArray[currentMemberIndex]?.id,
      }
    } else {
      updated.push({
        ...data,
        id: nanoid(18),
      })
    }

    const { showLiveWorkPreference } = getLiveWorkInSfMembers({
      ...formData,
      [householdMembers]: updated,
    })
    const showNRHPPreference =
      liveInTheNeighborhoodHouseholdMembers({ ...formData, [householdMembers]: updated }).length > 0

    saveFormData({
      ...formData,
      [householdMembers]: updated,
      [showLiveWorkInSfPrefStep]: showLiveWorkPreference,
      [showNRHPPrefStep]: showNRHPPreference,
    })
    setHouseholdMembersArray(updated)
    setPendingMember(null)
    setComponentToRender("AddHouseholdMembers")
    setIsEditingHouseholdMember(false)
  }

  const handleAddHouseholdMember = () => {
    setCurrentMemberIndex(householdMembersArray.length)
    setComponentToRender("HouseholdMemberForm")
    setApiErrorMessage(null)
    methods.reset({})
  }

  const handleEditHouseholdMember = (index: number) => {
    setIsEditingHouseholdMember(true)
    setCurrentMemberIndex(index)
    setComponentToRender("HouseholdMemberForm")
    setApiErrorMessage(null)
    methods.reset(householdMembersArray[index])
  }

  const handleUpdateHouseholdMember = (data: Record<string, string>) => {
    if (!addressNeedsVerification(data)) {
      // Household member inherits primary applicant's NRHP status if shared household
      const neighborhoodPreferenceMatch =
        data[householdMemberFields.sameAddressAsApplicant] === "true"
          ? formData.primaryApplicantNeighborhoodPreferenceAddressMatch
          : householdMembersArray[currentMemberIndex]?.[
              householdMemberFields.neighborhoodPreferenceAddressMatch
            ]

      saveHouseholdMember({
        ...data,
        [householdMemberFields.addressVerified]: "true",
        [householdMemberFields.neighborhoodPreferenceAddressMatch]: neighborhoodPreferenceMatch,
      })
      return
    }
    setLoading(true)
    const address = getHouseholdMemberAddress(data)
    const { firstName, middleName, lastName, birthMonth, birthDay, birthYear } = data
    const houseHoldMemberInfo = {
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      dob: formatApplicantDOB(birthMonth, birthDay, birthYear),
    }
    locateVerifiedAddress(address)
      .then((response) =>
        checkNeighborhoodPreferenceMatch(response, staticData, houseHoldMemberInfo).then(
          (neighborhoodMatch) => {
            setApiErrorMessage(null)
            setPendingMember({
              ...data,
              [householdMemberFields.street1]: response.address?.street1,
              [householdMemberFields.street2]: response.address?.street2,
              [householdMemberFields.city]: response.address?.city,
              [householdMemberFields.state]: response.address?.state,
              [householdMemberFields.zip]: response.address?.zip,
              [householdMemberFields.addressVerified]: "true",
              [householdMemberFields.neighborhoodPreferenceAddressMatch]: neighborhoodMatch,
            })
            setComponentToRender("HouseholdMemberVerifyAddress")
          }
        )
      )
      .catch((error) => {
        if (error.response?.status === 422) {
          setApiErrorMessage(
            t("error.addressValidation.notFound", {
              mailParams: getAddressErrorEmailLink(data, staticData, formData),
            })
          )
        } else {
          setApiErrorMessage(t("error.alert.badRequest"))
        }
        methods.reset(data)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleSubmitHouseholdMembers = () => {
    saveFormData({ ...formData, [householdMembers]: householdMembersArray })
    handleNextStep({ ...formData, [householdMembers]: householdMembersArray })
    setComponentToRender("AddHouseholdMembers")
  }

  const handleDeleteHouseholdMember = () => {
    const updatedHouseholdMembers = [...householdMembersArray]
    updatedHouseholdMembers.splice(currentMemberIndex, 1)
    const { showLiveWorkPreference } = getLiveWorkInSfMembers({
      ...formData,
      [householdMembers]: updatedHouseholdMembers,
    })
    const showNRHPPreference =
      liveInTheNeighborhoodHouseholdMembers({
        ...formData,
        [householdMembers]: updatedHouseholdMembers,
      }).length > 0

    saveFormData({
      ...formData,
      [householdMembers]: updatedHouseholdMembers,
      [showLiveWorkInSfPrefStep]: showLiveWorkPreference,
      [showNRHPPrefStep]: showNRHPPreference,
    })
    setHouseholdMembersArray(updatedHouseholdMembers)
    setComponentToRender("AddHouseholdMembers")
  }

  const handleCancelAddHouseholdMember = () => {
    setApiErrorMessage(null)
    setComponentToRender("AddHouseholdMembers")
  }

  switch (componentToRender) {
    case "HouseholdMemberForm": {
      return (
        <FormProvider {...methods}>
          <HouseholdMemberForm
            handleUpdateHouseholdMember={handleUpdateHouseholdMember}
            handleDeleteHouseholdMember={handleDeleteHouseholdMember}
            handleCancelAddHouseholdMember={handleCancelAddHouseholdMember}
            isEditing={isEditingHouseholdMember}
            methods={methods}
            loading={loading}
            addressError={apiErrorMessage}
          />
        </FormProvider>
      )
    }
    case "AddHouseholdMembers": {
      return (
        <AddHouseholdMembers
          householdMembers={householdMembersArray}
          handleAddHouseholdMember={handleAddHouseholdMember}
          handleEditHouseholdMember={handleEditHouseholdMember}
          handleSubmitHouseholdMembers={handleSubmitHouseholdMembers}
        />
      )
    }
    case "HouseholdMemberVerifyAddress": {
      if (!pendingMember) return null
      const member = pendingMember
      return (
        <VerifyAddress
          addressData={getHouseholdMemberAddress(member)}
          onConfirm={() => saveHouseholdMember(member)}
          onEdit={() => {
            methods.reset(member)
            setComponentToRender("HouseholdMemberForm")
          }}
        />
      )
    }
  }
}

export default HouseholdMemberMultiStepWrapper
