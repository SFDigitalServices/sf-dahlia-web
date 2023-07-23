import React, { useState } from "react";

export default function PersonalInfo({step, setStep}) {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [emailAddress, setEmailAddress] = useState("")

    const handleFirstNameChange = (e) => setFirstName(e.target.value)
    const handleLastNameChange = (e) => setLastName(e.target.value)
    const handleEmailAddressChange = (e) => setEmailAddress(e.target.value)
    const handleSubmit = (e) => {
        e.preventDefault();
        setStep(step + 1)
    }

    return (
        <div>
            <h1>Whats Your Name</h1>
            <hr/>
            <form>
                <label>
                    First Name:
                    <input type="text" value={firstName} onChange={handleFirstNameChange} />
                </label>
                <label>
                    Last Name:
                    <input type="text" value={lastName} onChange={handleLastNameChange} />
                </label>
                <label>
                    Email Address:
                    <input type="text" value={emailAddress} onChange={handleEmailAddressChange} />
                </label>
                <input type="submit" value="Next" onClick={handleSubmit} />
            </form>
        </div>
    )
}
