import React from "react"
import { t } from "@bloom-housing/ui-components"

interface PhoneProps {
  label: string
}

const Phone = ({ label }: PhoneProps) => {
  return (
    <div style={{ border: "2px dashed black", padding: "4px", margin: "4px" }}>
      <p>Phone Component</p>
      <p>label: {t(label)}</p>
    </div>
  )
}

export default Phone
