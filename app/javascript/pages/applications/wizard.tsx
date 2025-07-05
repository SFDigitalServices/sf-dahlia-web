import React, { useEffect, useState } from "react"
import "@trussworks/react-uswds/lib/index.css"
import Layout from "../../layouts/Layout"
import { RailsListing } from "../../modules/listings/SharedHelpers"
import B1Name from "./pages/b1-name"
import B2Contact from "./pages/b2-contact"

const Wizard = () => {
  const [listing, setListing] = useState<RailsListing>(null)

  const [applicationData, setApplicationData] = useState({})

  const [applicationPage, setApplicationPage] = useState(1)

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
      applicationData={applicationData}
      nextPage={nextPage}
      prevPage={prevPage}
      saveData={saveData}
    />,
    <B2Contact
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
