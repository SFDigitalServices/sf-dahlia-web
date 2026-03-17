import React, { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { useFormEngineContext } from "../../../../formEngine/formEngineContext"
import HouseholdMemberForm from "./HouseholdMemberForm"
import AddHouseholdMembers from "./AddHouseholdMembers"
import VerifyAddress from "../VerifyAddress"

interface HouseholdMemberMultiStepWrapperProps {
  name: string
  fieldNames: {
    firstName: string
    middleName: string
    lastName: string
    birthMonth: string
    birthDay: string
    birthYear: string
    address: string
    workInSf: string
    relation: string
  }
}

type multiStepComponents =
  | "AddHouseholdMembers"
  | "HouseholdMemberForm"
  | "HouseholdMemberVerifyAddress"

const HouseholdMemberMultiStepWrapper = ({
  fieldNames,
  name,
}: HouseholdMemberMultiStepWrapperProps) => {
  const { saveFormData, formData, handleNextStep } = useFormEngineContext()
  const [currentMemberIndex, setCurrentMemberIndex] = useState<number>(0)
  const [componentToRender, setComponentToRender] =
    useState<multiStepComponents>("AddHouseholdMembers")

  const [householdMembers, setHouseholdMembers] = useState<Record<string, unknown>[]>(
    (formData[name] as Record<string, unknown>[]) || []
  )

  const methods = useForm({
    mode: "onChange",
    shouldFocusError: false,
    defaultValues: householdMembers[currentMemberIndex] || {},
  })

  const handleAddHouseholdMember = () => {
    setHouseholdMembers([...householdMembers, {}])
    setCurrentMemberIndex(householdMembers.length)
    setComponentToRender("HouseholdMemberForm")
    methods.reset({})
  }

  const handleEditHouseholdMember = (index: number) => {
    setCurrentMemberIndex(index)
    setComponentToRender("HouseholdMemberForm")
    methods.reset(householdMembers[index])
  }

  const handleUpdateHouseholdMember = (data: Record<string, unknown>) => {
    const updatedHouseholdMembers = [...householdMembers]
    updatedHouseholdMembers[currentMemberIndex] = data
    saveFormData({ ...formData, householdMembers: updatedHouseholdMembers })
    setHouseholdMembers(updatedHouseholdMembers)
    setComponentToRender("AddHouseholdMembers")
  }

  const handleSubmitHouseholdMembers = () => {
    saveFormData({ ...formData, householdMembers })
    handleNextStep({ ...formData, householdMembers })
    setComponentToRender("AddHouseholdMembers")
  }

  switch (componentToRender) {
    case "HouseholdMemberForm": {
      return (
        <FormProvider {...methods}>
          <HouseholdMemberForm
            fieldNames={fieldNames}
            handleUpdateHouseholdMember={handleUpdateHouseholdMember}
            methods={methods}
          />
        </FormProvider>
      )
    }
    case "AddHouseholdMembers": {
      return (
        <AddHouseholdMembers
          householdMembers={householdMembers}
          handleAddHouseholdMember={handleAddHouseholdMember}
          handleEditHouseholdMember={handleEditHouseholdMember}
          handleSubmitHouseholdMembers={handleSubmitHouseholdMembers}
        />
      )
    }
    case "HouseholdMemberVerifyAddress": {
      return <VerifyAddress />
    }
  }
}

export default HouseholdMemberMultiStepWrapper
