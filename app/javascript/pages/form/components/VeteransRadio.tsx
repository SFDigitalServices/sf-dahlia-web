import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"

interface VeteransRadioProps {
  label: string
}

const VeteransRadio = ({ label }: VeteransRadioProps) => {
  return (
    <Card>
      <Card.Header>VeteransRadio Component</Card.Header>
      <Card.Section>{t(label)}</Card.Section>
    </Card>
  )
}

export default VeteransRadio
