import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"

interface AddressProps {
  label: string
}

const Address = ({ label }: AddressProps) => {
  return (
    <Card>
      <Card.Header>Address Component</Card.Header>
      <Card.Section>{t(label)}</Card.Section>
    </Card>
  )
}

export default Address
