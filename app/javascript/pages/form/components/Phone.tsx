import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"

interface PhoneProps {
  label: string
}

const Phone = ({ label }: PhoneProps) => {
  return (
    <Card>
      <Card.Header>Phone Component</Card.Header>
      <Card.Section>{t(label)}</Card.Section>
    </Card>
  )
}

export default Phone
