import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"

interface RadioProps {
  label: string
}

const Radio = ({ label }: RadioProps) => {
  return (
    <Card>
      <Card.Header>Radio Component</Card.Header>
      <Card.Section>{t(label)}</Card.Section>
    </Card>
  )
}

export default Radio
