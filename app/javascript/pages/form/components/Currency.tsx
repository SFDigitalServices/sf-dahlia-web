import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"

interface CurrencyProps {
  label: string
}

const Currency = ({ label }: CurrencyProps) => {
  return (
    <Card>
      <Card.Header>Currency Component</Card.Header>
      <Card.Section>{t(label)}</Card.Section>
    </Card>
  )
}

export default Currency
