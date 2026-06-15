import React from "react"
import { t } from "@uic"
import { Card } from "@bloom-housing/ui-seeds"

interface PreferenceCheckboxGroupProps {
  label: string
}

const PreferenceCheckboxGroup = ({ label }: PreferenceCheckboxGroupProps) => {
  return (
    <Card>
      <Card.Header>MonthlyRent Component</Card.Header>
      <Card.Section>{t(label)}</Card.Section>
    </Card>
  )
}

export default PreferenceCheckboxGroup
