import React, { useState } from "react"

export default function ContactInfo({ step, setStep }) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [address, setAddress] = useState("")

  const handlePhoneNumberChange = (e) => setPhoneNumber(e.target.value)
  const handleAddressChange = (e) => setAddress(e.target.value)
  const handleSubmit = (e) => {
    e.preventDefault()
    setStep(step + 1)
  }

  return (
    <div>
      <h1>Thanks. Now we need to know how to contact you.</h1>
      <hr />
      <form>
        <div
          style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "1em" }}
        >
          <label style={{ margin: ".5em" }}>
            Phone Number:
            <input
              style={{ border: "solid", margin: ".5em" }}
              type="text"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
            />
          </label>
          <label style={{ margin: ".5em" }}>
            Address:
            <input
              style={{ border: "solid", margin: ".5em" }}
              type="text"
              value={address}
              onChange={handleAddressChange}
            />
          </label>
          <input
            style={{ border: "solid", padding: ".5em" }}
            type="submit"
            value="Next"
            onClick={handleSubmit}
          />
        </div>
      </form>
    </div>
  )
}
