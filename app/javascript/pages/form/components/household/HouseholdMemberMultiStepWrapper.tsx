import React, { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { useFormEngineContext } from "../../../../formEngine/formEngineContext"
import { updateFormPath } from "../../../../util/formEngineUtil"
import HouseholdMemberForm from "./HouseholdMemberForm"
import AddHouseholdMembers from "./AddHouseholdMembers"

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

type multiStepComponents = "AddHouseholdMembers" | "HouseholdMemberForm"

const HouseholdMemberMultiStepWrapper = ({
  fieldNames,
  name,
}: HouseholdMemberMultiStepWrapperProps) => {
  const { currentStepIndex, stepInfoMap, saveFormData, formData, handleNextStep } =
    useFormEngineContext()
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
    updateFormPath(currentStepIndex + 1, stepInfoMap)
    methods.reset({})
  }

  const handleEditHouseholdMember = (index: number) => {
    setCurrentMemberIndex(index)
    setComponentToRender("HouseholdMemberForm")
    updateFormPath(currentStepIndex + 1, stepInfoMap)
    methods.reset(householdMembers[index])
  }

  const handleUpdateHouseholdMember = (data: Record<string, unknown>) => {
    const updatedHouseholdMembers = [...householdMembers]
    updatedHouseholdMembers[currentMemberIndex] = data
    setHouseholdMembers(updatedHouseholdMembers)
    setComponentToRender("AddHouseholdMembers")
  }

  const handleSubmitHouseholdMembers = () => {
    saveFormData({ name: householdMembers })
    handleNextStep({ ...formData, name: householdMembers })
    setComponentToRender("AddHouseholdMembers")
  }

  if (componentToRender === "HouseholdMemberForm") {
    return (
      <FormProvider {...methods}>
        <HouseholdMemberForm
          fieldNames={fieldNames}
          handleUpdateHouseholdMember={handleUpdateHouseholdMember}
          methods={methods}
        />
      </FormProvider>
    )
  } else if (componentToRender === "AddHouseholdMembers") {
    return (
      <AddHouseholdMembers
        householdMembers={householdMembers}
        handleAddHouseholdMember={handleAddHouseholdMember}
        handleEditHouseholdMember={handleEditHouseholdMember}
        handleSubmitHouseholdMembers={handleSubmitHouseholdMembers}
      />
    )
  }
}

export default HouseholdMemberMultiStepWrapper
