import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"

interface AlternateContactTypeProps {
  label: string
}

const AlternateContactType = ({ label }: AlternateContactTypeProps) => {
  return (
    <Card>
      <Card.Header>AlternateContactType Component</Card.Header>
      <Card.Section>{t(label)}</Card.Section>
    </Card>
  )
}

export default AlternateContactType
