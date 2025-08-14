import React from "react"

interface PhoneProps {}

const Phone = ({}: PhoneProps) => {
  return (
    <div style={{ border: "2px dashed black", padding: "4px", margin: "4px" }}>
      <p>Phone Component</p>
    </div>
  )
}

export default Phone
