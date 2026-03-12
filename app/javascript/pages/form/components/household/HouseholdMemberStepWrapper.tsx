import React, { Children } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card } from "@bloom-housing/ui-seeds"
import styles from "../ListingApplyStepWrapper.module.scss"

interface HouseholdMemberStepWrapperProps {
  title: string
  description: string
  children: React.ReactNode
  setAddMember: (addMember: boolean) => void
  householdMember: Record<string, unknown>
  updateHouseholdMember: (data: Record<string, unknown>) => void
}

const HouseholdMemberStepWrapper = ({
  title,
  description,
  children,
  setAddMember,
  householdMember,
  updateHouseholdMember,
}: HouseholdMemberStepWrapperProps) => {
  const methods = useForm({
    mode: "onChange",
    shouldFocusError: false,
    defaultValues: householdMember,
  })

  const onSubmit = (data: Record<string, unknown>) => {
    updateHouseholdMember(data)
    setAddMember(false)
  }
  return (
    <FormProvider {...methods}>
      <Card>
        <Card.Header divider="inset">
          <h1 className={styles["step-title"]}>{t(title)}</h1>
          <p className="field-note text-base">{t(description)}</p>
        </Card.Header>
        <Form onSubmit={methods.handleSubmit(onSubmit)}>
          {Children.map(children, (child) => {
            return <Card.Section divider="inset">{child}</Card.Section>
          })}
          <Card.Footer className={styles["step-footer"]}>
            <Button variant="primary" type="submit">
              {t("label.householdMemberSave")}
            </Button>
          </Card.Footer>
        </Form>
      </Card>
    </FormProvider>
  )
}

export default HouseholdMemberStepWrapper
