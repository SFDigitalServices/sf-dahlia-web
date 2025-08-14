import React from "react"

interface AddressProps {}

const Address = ({}: AddressProps) => {
  return (
    <div style={{ border: "2px dashed black", padding: "4px", margin: "4px" }}>
      <p>Address Component</p>
    </div>
  )
}

export default Address
