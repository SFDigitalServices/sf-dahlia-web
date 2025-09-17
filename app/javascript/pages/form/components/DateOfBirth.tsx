import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"

interface DateOfBirthProps {
  label: string
}

const DateOfBirth = ({ label }: DateOfBirthProps) => {
  return (
    <Card>
      <Card.Header>DateOfBirth Component</Card.Header>
      <Card.Section>{t(label)}</Card.Section>
    </Card>
  )
}

export default DateOfBirth
