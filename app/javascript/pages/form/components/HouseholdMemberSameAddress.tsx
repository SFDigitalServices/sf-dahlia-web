import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"

interface HouseholdMemberSameAddressProps {
  label: string
}

const HouseholdMemberSameAddress = ({ label }: HouseholdMemberSameAddressProps) => {
  return (
    <Card>
      <Card.Header>HouseholdMemberSameAddress Component</Card.Header>
      <Card.Section>{t(label)}</Card.Section>
    </Card>
  )
}

export default HouseholdMemberSameAddress
