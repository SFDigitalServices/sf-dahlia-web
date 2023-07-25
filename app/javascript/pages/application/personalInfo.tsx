import React, { useState } from "react"

export default function PersonalInfo({ step, setStep }) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [emailAddress, setEmailAddress] = useState("")

  const handleFirstNameChange = (e) => setFirstName(e.target.value)
  const handleLastNameChange = (e) => setLastName(e.target.value)
  const handleDateOfBirth = (e) => setDateOfBirth(e.target.value)
  const handleEmailAddressChange = (e) => setEmailAddress(e.target.value)
  const handleSubmit = (e) => {
    e.preventDefault()
    setStep(step + 1)
  }

  return (
    <div>
      <h1>Whats Your Name</h1>
      <hr />
      <form>
        <div
          style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "1em" }}
        >
          <label style={{ margin: ".5em" }}>
            First Name:
            <input
              style={{ border: "solid", margin: ".5em" }}
              type="text"
              value={firstName}
              onChange={handleFirstNameChange}
            />
          </label>
          <label style={{ margin: ".5em" }}>
            Last Name:
            <input
              style={{ border: "solid", margin: ".5em" }}
              type="text"
              value={lastName}
              onChange={handleLastNameChange}
            />
          </label>
          <label style={{ margin: ".5em" }}>
            Your Date Of Birth:
            <input
              style={{ border: "solid", margin: ".5em" }}
              type="text"
              value={dateOfBirth}
              onChange={handleDateOfBirth}
            />
          </label>
          <label style={{ margin: ".5em" }}>
            Email Address:
            <input
              style={{ border: "solid", margin: ".5em" }}
              type="text"
              value={emailAddress}
              onChange={handleEmailAddressChange}
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
