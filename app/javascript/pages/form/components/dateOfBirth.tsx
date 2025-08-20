import React from "react"
import { t } from "@bloom-housing/ui-components"

interface DateOfBirthProps {
  label: string
}

const DateOfBirth = ({ label }: DateOfBirthProps) => {
  return (
    <div style={{ border: "2px dashed black", padding: "4px", margin: "4px" }}>
      <p>DateOfBirth Component</p>
      <p>label: {t(label)}</p>
    </div>
  )
}

export default DateOfBirth
