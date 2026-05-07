import React from "react"
import ListingApplyHouseholdIncomeHeader from "./ListingApplyHouseholdIncomeHeader"
import Currency from "./Currency"
import Radio from "./Radio"
import { Button, Card } from "@bloom-housing/ui-seeds"
import { Form, t } from "@bloom-housing/ui-components"
import { useForm, FormProvider } from "react-hook-form"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import styles from "./ListingApplyStepWrapper.module.scss"
import { checkHouseholdEligibility } from "../../../api/formApiService"

interface HouseholdIncomeProps {
  title: string
  headerComponentName: string
  currencyLabel: string
  radioLabel: string
  currencyErrorMessage: string
  radioErrorMessage: string
  hideLabel: boolean
  options: {
    id: string
    label: string
    value: string
  }[]
  fieldNames: {
    amount: string
    answer: string
  }
}

const HouseholdIncome = ({
  currencyLabel,
  radioLabel,
  currencyErrorMessage,
  radioErrorMessage,
  hideLabel,
  options,
  fieldNames: { amount, answer },
}: HouseholdIncomeProps) => {
  const formEngineContext = useFormEngineContext()
  const {
    staticData,
    formData,
    saveFormData,
    stepInfoMap,
    currentStepIndex,
    handleNextStep,
    handlePrevStep,
  } = formEngineContext
  const [apiErrorMessage, setApiErrorMessage] = React.useState<string | null>(null)
  const currentStepInfo = stepInfoMap[currentStepIndex]
  const defaultValues = currentStepInfo.fieldNames.reduce((acc, fieldName) => {
    acc[fieldName] = formData[fieldName]
    return acc
  }, {})

  const formMethods = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
    defaultValues,
  })

  const onSubmit = (data: Record<string, unknown>) => {
    // Skip validation if household has vouchers
    if (formData.householdVouchersSubsidies === "true") {
      saveFormData({ ...data })
      handleNextStep({ ...formData, ...data })
      return
    }
    const householdMembers = formData.householdMembers as Record<string, unknown>[]
    const householdSize = householdMembers.length + 1
    const hasChildUnder6 = householdMembers.some((member) => {
      if (!member.birthYear || !member.birthMonth || !member.birthDay) return false
      const memberBirthdate = new Date(
        member.birthYear as number,
        (member.birthMonth as number) - 1,
        member.birthDay as number
      )
      return memberBirthdate > new Date()
    })
    const income = (data.amount as number) * (data.answer as number)
    checkHouseholdEligibility(staticData.listing.Id, householdSize, income, hasChildUnder6)
      .then((response) => {
        console.log("response", response)
        if (response.incomeEligibilityResult === "Too Low") {
          setApiErrorMessage(t("error.householdIncomeTooLow"))
          return
        } else if (response.incomeEligibilityResult === "Too High") {
          setApiErrorMessage(t("error.householdIncomeTooHigh"))
          return
        }
        saveFormData({ ...data })
        handleNextStep({ ...formData, ...data })
      })
      .catch((error) => {
        console.error(error)
      })
  }

  return (
    <FormProvider {...formMethods}>
      <Card>
        <Card.Section>
          <Button variant="text" className={styles["back-button"]} onClick={handlePrevStep}>
            {t("t.back")}
          </Button>
        </Card.Section>
        <ListingApplyHouseholdIncomeHeader />
        <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Card.Section>
            <Currency
              label={currencyLabel}
              errorMessage={apiErrorMessage || currencyErrorMessage}
              fieldNames={{ amount }}
            />
          </Card.Section>
          <Card.Section>
            <Radio
              label={radioLabel}
              errorMessage={radioErrorMessage}
              hideLabel={hideLabel}
              options={options}
              fieldNames={{ answer }}
            />
          </Card.Section>
          <Card.Footer className={styles["step-footer"]}>
            <Button variant="primary" type="submit">
              {t("t.next")}
            </Button>
          </Card.Footer>
        </Form>
      </Card>
    </FormProvider>
  )
}

export default HouseholdIncome
