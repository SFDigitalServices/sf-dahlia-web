import React, { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { useFormEngineContext } from "../../../../formEngine/formEngineContext"
import HouseholdMemberForm from "./HouseholdMemberForm"
import AddHouseholdMembers from "./AddHouseholdMembers"
import VerifyAddress from "../VerifyAddress"

interface HouseholdMemberMultiStepWrapperProps {
  fieldNames: {
    householdMembers: string
  }
}

type multiStepComponents =
  | "AddHouseholdMembers"
  | "HouseholdMemberForm"
  | "HouseholdMemberVerifyAddress"

const HouseholdMemberMultiStepWrapper = ({
  fieldNames: { householdMembers },
}: HouseholdMemberMultiStepWrapperProps) => {
  const { saveFormData, formData, handleNextStep } = useFormEngineContext()
  const [currentMemberIndex, setCurrentMemberIndex] = useState<number>(0)
  const [componentToRender, setComponentToRender] =
    useState<multiStepComponents>("AddHouseholdMembers")
  const [isEditingHouseholdMember, setIsEditingHouseholdMember] = useState(false)

  const [householdMembersArray, setHouseholdMembersArray] = useState<Record<string, unknown>[]>(
    (formData[householdMembers] as Record<string, unknown>[]) || []
  )

  const methods = useForm({
    mode: "onChange",
    shouldFocusError: false,
    defaultValues: householdMembersArray[currentMemberIndex],
  })

  const handleAddHouseholdMember = () => {
    setCurrentMemberIndex(householdMembersArray.length)
    setComponentToRender("HouseholdMemberForm")
    methods.reset({})
  }

  const handleEditHouseholdMember = (index: number) => {
    setIsEditingHouseholdMember(true)
    setCurrentMemberIndex(index)
    setComponentToRender("HouseholdMemberForm")
    methods.reset(householdMembersArray[index])
  }

  const handleUpdateHouseholdMember = (data: Record<string, unknown>) => {
    const updatedHouseholdMembers = [...householdMembersArray]
    if (isEditingHouseholdMember) {
      updatedHouseholdMembers[currentMemberIndex] = data
    } else {
      updatedHouseholdMembers.push(data)
    }
    saveFormData({ ...formData, householdMembers: updatedHouseholdMembers })
    setHouseholdMembersArray(updatedHouseholdMembers)
    setComponentToRender("AddHouseholdMembers")
    setIsEditingHouseholdMember(false)
  }

  const handleSubmitHouseholdMembers = () => {
    saveFormData({ ...formData, householdMembers: householdMembersArray })
    handleNextStep({ ...formData, householdMembers: householdMembersArray })
    setComponentToRender("AddHouseholdMembers")
  }

  const handleDeleteHouseholdMember = () => {
    const updatedHouseholdMembers = [...householdMembersArray]
    updatedHouseholdMembers.splice(currentMemberIndex, 1)
    saveFormData({ ...formData, householdMembers: updatedHouseholdMembers })
    setHouseholdMembersArray(updatedHouseholdMembers)
    setComponentToRender("AddHouseholdMembers")
  }

  const handleCancelAddHouseholdMember = () => {
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
      return <VerifyAddress address="householdMemberAddress" />
    }
  }
}

export default HouseholdMemberMultiStepWrapper
