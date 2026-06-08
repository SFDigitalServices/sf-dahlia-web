import React, { useState } from "react"
import { nanoid } from "nanoid"
import { useForm, FormProvider } from "react-hook-form"
import { useFormEngineContext } from "../../../../formEngine/formEngineContext"
import HouseholdMemberForm from "./HouseholdMemberForm"
import AddHouseholdMembers from "./AddHouseholdMembers"
import VerifyAddress from "../VerifyAddress"
import { Address, locateVerifiedAddress } from "../../../../api/formApiService"
import { addressesMatch, getAddressErrorEmailLink } from "../../../../util/formEngineUtil"
import { t } from "@bloom-housing/ui-components"

interface HouseholdMemberMultiStepWrapperProps {
  fieldNames: {
    householdMembers: string
  }
}
const householdMemberFields = {
  street1: "householdMemberAddressStreet",
  street2: "householdMemberAddressAptOrUnit",
  city: "householdMemberAddressCity",
  state: "householdMemberAddressState",
  zip: "householdMemberAddressZipcode",
  sameAddressAsApplicant: "hasSameAddressAsApplicant",
  addressVerified: "householdMemberAddressVerified",
}

type multiStepComponents =
  | "AddHouseholdMembers"
  | "HouseholdMemberForm"
  | "HouseholdMemberVerifyAddress"

const HouseholdMemberMultiStepWrapper = ({
  fieldNames: { householdMembers },
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
      addressesMatch(getHouseholdMemberAddress(data), getHouseholdMemberAddress(existingMember))
    return !isAlreadyVerified
  }

  const saveHouseholdMember = (data: Record<string, unknown>) => {
    const updatedMembersArray = [...householdMembersArray]
    if (isEditingHouseholdMember) {
      updatedMembersArray[currentMemberIndex] = {
        ...data,
        id: householdMembersArray[currentMemberIndex]?.id,
      }
    } else {
      updatedMembersArray.push({ ...data, id: nanoid(18) })
    }
    saveFormData({ ...formData, [householdMembers]: updatedMembersArray })
    setHouseholdMembersArray(updatedMembersArray)
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
      saveHouseholdMember({ ...data, [householdMemberFields.addressVerified]: "true" })
      return
    }

    setLoading(true)
    locateVerifiedAddress(getHouseholdMemberAddress(data))
      .then((response) => {
        setApiErrorMessage(null)
        setPendingMember({
          ...data,
          [householdMemberFields.street1]: response.address?.street1,
          [householdMemberFields.street2]: response.address?.street2,
          [householdMemberFields.city]: response.address?.city,
          [householdMemberFields.state]: response.address?.state,
          [householdMemberFields.zip]: response.address?.zip,
          [householdMemberFields.addressVerified]: "true",
        })
        setComponentToRender("HouseholdMemberVerifyAddress")
      })
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
    saveFormData({ ...formData, [householdMembers]: updatedHouseholdMembers })
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
      return (
        <VerifyAddress
          addressData={getHouseholdMemberAddress(pendingMember)}
          onConfirm={() => saveHouseholdMember(pendingMember)}
          onEdit={() => {
            methods.reset(pendingMember)
            setComponentToRender("HouseholdMemberForm")
          }}
        />
      )
    }
  }
}

export default HouseholdMemberMultiStepWrapper
