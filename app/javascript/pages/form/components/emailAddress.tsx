import React from "react"
import { t } from "@bloom-housing/ui-components"

interface EmailAddressProps {
  label: string
}

const Name = ({ label }: EmailAddressProps) => {
  return (
    <div style={{ border: "2px dashed black", padding: "4px", margin: "4px" }}>
      <p>EmailAddress Component</p>
      <p>label: {t(label)}</p>
    </div>
  )
}

export default Name
