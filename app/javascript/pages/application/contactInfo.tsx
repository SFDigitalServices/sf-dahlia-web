import React, { useState } from "react";

export default function ContactInfo() {
    const [phoneNumber, setPhoneNumber] = useState("")
    const [address, setAddress] = useState("")

    const handlePhoneNumberChange = (e) => setPhoneNumber(e.target.value)
    const handleAddressChange = (e) => setAddress(e.target.value)

    return (
        <div>
            <h1>Thanks. Now we need to know how to contact you.</h1>
            <hr/>
            <form>
                <label>
                    Phone Number:
                    <input type="text" value={phoneNumber} onChange={handlePhoneNumberChange} />
                </label>
                <label>
                    Address:
                    <input type="text" value={address} onChange={handleAddressChange} />
                </label>
            </form>
        </div>
    )
}
