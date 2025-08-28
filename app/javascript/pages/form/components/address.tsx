import React from "react"
import { t } from "@bloom-housing/ui-components"

interface AddressProps {
  label: string
}

const Address = ({ label }: AddressProps) => {
  return (
    <div style={{ border: "2px dashed black", padding: "4px", margin: "4px" }}>
      <p>Address Component</p>
      <p>label: {t(label)}</p>
    </div>
  )
}

export default Address
