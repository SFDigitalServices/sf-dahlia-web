import React from "react"

interface EmailAddressProps {}

const Name = ({}: EmailAddressProps) => {
  return (
    <div style={{ border: "2px dashed black", padding: "4px", margin: "4px" }}>
      <p>EmailAddress Component</p>
    </div>
  )
}

export default Name
