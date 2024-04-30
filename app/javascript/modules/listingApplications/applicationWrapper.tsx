import React, { useState, useEffect, useMemo } from "react"
import type BaseRailsListing from "../../api/types/rails/listings/BaseRailsListing"
import {
  type ApplicationPageConfig,
  generateListingApplicationConfig,
} from "../../util/listingApplicationUtils"

// consider using React.lazy to import components
import { CustomEducatorScreening } from "./CustomEducatorScreening"
import { Overview } from "./Overview"
import { AutofillPreview } from "./AutofillPreview"
import { Prequisites } from "./Prequisites"
import { Name } from "./Name"
import { Contact } from "./Contact"
import { AlternateContact } from "./AlternateContact"
import { Fallback } from "./Fallback"

interface Props {
  listing: BaseRailsListing
}

// <slug>: <componentName>
const componentMap = {
  "custom-educator-screening": CustomEducatorScreening,
  overview: Overview,
  "autofill-preview": AutofillPreview,
  prequisites: Prequisites,
  name: Name,
  contact: Contact,
  "alternate-contact-type": AlternateContact,
}

export const ApplicationWrapper = ({ listing }: Props) => {
  const [formPages, setFormPages] = useState<ApplicationPageConfig[]>([])
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    setFormPages(generateListingApplicationConfig(listing).pages)
  }, [listing])

  const onClickNext = () => {
    if (currentPage < formPages.length - 1) setCurrentPage(currentPage + 1)
  }
  const onClickPrevious = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1)
  }

  const getPage = useMemo(() => {
    if (formPages.length === 0) return
    const FormPage = componentMap[formPages[currentPage].slug] || Fallback
    return (
      <FormPage
        pageConfig={formPages[currentPage]}
        clickNext={onClickNext}
        clickPrevious={onClickPrevious}
      />
    )
  }, [formPages, currentPage])

  return (
    <div className="text-center">
      <h1>Application Wrapper</h1>
      {formPages.length > 0 && (
        <>
          <h2>current section: {formPages[currentPage].section}</h2>
          {getPage}
        </>
      )}
      <pre className="text-left">{JSON.stringify(formPages, null, 2)}</pre>
    </div>
  )
}
