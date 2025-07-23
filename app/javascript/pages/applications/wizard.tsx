import React, { useState } from "react"
import B1Name from "./pages/b1-name"
import B2Contact from "./pages/b2-contact"
import E2cLiveWorkPreference from "./pages/e2c-live-work-preference"

export interface ApplicationData {
  "first-name"?: string
  "middle-name"?: string
  "last-name"?: string
  "dob-month"?: string
  "dob-day"?: string
  "dob-year"?: string
  email?: string
  "no-email"?: boolean
  "primary-phone"?: string
  "primary-phone-type"?: string
  "no-phone"?: boolean
  "show-additional-phone"?: boolean
  "additional-phone"?: string
  "additional-phone-type"?: string
  "address-street"?: string
  "address-unit"?: string
  "address-city"?: string
  "address-state"?: string
  "address-zip"?: string
  "show-mail-address"?: boolean
  "mail-address-street"?: string
  "mail-address-unit"?: string
  "mail-address-city"?: string
  "mail-address-state"?: string
  "mail-address-zip"?: string
  "claim-preference"?: boolean
  "no-preference"?: boolean
  "preference-option"?: string
  "live-in-sf-claimant"?: string
  "live-in-sf-doctype"?: string
  "live-in-sf-proof"?: string
  "work-in-sf-claimant"?: string
  "work-in-sf-doctype"?: string
  "work-in-sf-proof"?: string
}

const Wizard = () => {
  const [applicationData, setApplicationData] = useState<ApplicationData>({})

  const [applicationPage, setApplicationPage] = useState(0)

  const saveData = (data) => {
    setApplicationData({ ...applicationData, ...data })
  }

  const nextPage = () => {
    if (applicationPage < applicationPages.length - 1) setApplicationPage(applicationPage + 1)
  }
  const prevPage = () => {
    if (applicationPage > 0) setApplicationPage(applicationPage - 1)
  }

  const applicationPages = [
    <B1Name
      nextPage={nextPage}
      prevPage={prevPage}
      saveData={saveData}
      applicationData={applicationData}
    />,
    <B2Contact
      nextPage={nextPage}
      prevPage={prevPage}
      saveData={saveData}
      applicationData={applicationData}
    />,
    <E2cLiveWorkPreference
      nextPage={nextPage}
      prevPage={prevPage}
      saveData={saveData}
      applicationData={applicationData}
    />,
  ]

  return (
    <div style={{ textAlign: "center" }}>
      <h3>PAGE {JSON.stringify(applicationPage)}</h3>
      {applicationPages[applicationPage]}
    </div>
  )
}

export default Wizard
