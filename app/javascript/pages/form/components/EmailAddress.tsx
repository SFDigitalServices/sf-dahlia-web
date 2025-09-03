import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"

interface EmailAddressProps {
  label: string
}

const Name = ({ label }: EmailAddressProps) => {
  return (
    <Card>
      <Card.Header>EamilAddress Component</Card.Header>
      <Card.Section>{t(label)}</Card.Section>
    </Card>
  )
}

export default Name
