import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"

interface YesNoRadioProps {
  label: string
}

const YesNoRadio = ({ label }: YesNoRadioProps) => {
  return (
    <Card>
      <Card.Header>YesNoRadio Component</Card.Header>
      <Card.Section>{t(label)}</Card.Section>
    </Card>
  )
}

export default YesNoRadio
