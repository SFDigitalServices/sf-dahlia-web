import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"

interface SelectProps {
  label: string
}

const Select = ({ label }: SelectProps) => {
  return (
    <Card>
      <Card.Header>Select Component</Card.Header>
      <Card.Section>{t(label)}</Card.Section>
    </Card>
  )
}

export default Select
