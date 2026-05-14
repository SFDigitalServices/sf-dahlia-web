import React from "react"
import ListingApplyHouseholdIncomeHeader from "./ListingApplyHouseholdIncomeHeader"
import Currency from "./Currency"
import Radio from "./Radio"
import { Button, Card, LoadingState } from "@bloom-housing/ui-seeds"
import { Form, t } from "@bloom-housing/ui-components"
import { useForm, FormProvider } from "react-hook-form"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import styles from "./ListingApplyStepWrapper.module.scss"
import { checkHouseholdEligibility } from "../../../api/formApiService"
import ListingApplyStepErrorMessage from "./ListingApplyStepErrorMessage"

interface HouseholdIncomeProps {
  title: string
  headerComponentName: string
  currencyLabel: string
  currencyErrorMessage: string
  radioLabel: string
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
  currencyErrorMessage,
  radioLabel,
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
  const [loading, setLoading] = React.useState(false)
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
    setApiErrorMessage(null)
    setLoading(true)
    // Skip validation if household has vouchers
    if (formData.householdVouchersSubsidies === "true") {
      handleNextStep({ ...formData, ...data })
      return
    }
    const householdMembers = (formData.householdMembers as Record<string, unknown>[]) || []
    const householdSize = householdMembers.length + 1
    const childrenUnderSix = householdMembers.filter((member) => {
      if (!member.birthYear || !member.birthMonth || !member.birthDay) return false
      const memberBirthdate = new Date(
        member.birthYear as number,
        (member.birthMonth as number) - 1,
        member.birthDay as number
      )
      return memberBirthdate > new Date()
    })
    const income =
      Number.parseFloat((data[amount] as string).replace(/,/g, "")) *
      Number.parseFloat(data[answer] as string)
    checkHouseholdEligibility(
      staticData.listing.Id,
      householdSize,
      income.toString(),
      childrenUnderSix.length
    )
      .then((response) => {
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
      .finally(() => {
        setLoading(false)
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
          {apiErrorMessage && (
            <ListingApplyStepErrorMessage
              errorMessage={t("error.notEligible")}
              errorNote={t("error.notEligibleDescription")}
              errorNoteHeading={apiErrorMessage}
              onClose={() => setApiErrorMessage(null)}
            />
          )}
          <LoadingState loading={loading}>
            <Card.Section>
              <Currency
                label={currencyLabel}
                errorMessage={currencyErrorMessage}
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
          </LoadingState>
        </Form>
      </Card>
    </FormProvider>
  )
}

export default HouseholdIncome
