import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"

interface MonthlyRentProps {
  label: string
}

const MonthlyRent = ({ label }: MonthlyRentProps) => {
  return (
    <Card>
      <Card.Header>MonthlyRent Component</Card.Header>
      <Card.Section>{t(label)}</Card.Section>
    </Card>
  )
}

export default MonthlyRent
