import React, { useState } from "react"
import { t } from "@bloom-housing/ui-components"
import { Button } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import { submitForm } from "../../../api/formApiService"

const ListingApplyTerms = () => {
  const formEngineContext = useFormEngineContext()
  const {
    handlePrevStep,
    formData,
    staticData: { listing },
  } = formEngineContext
  const [isSubmitting, setIsSubmitting] = useState(false)
  const handleSubmit = () => {
    if (isSubmitting) return

    const confirmSubmit = window.confirm(
      "WARNING: You are on the React application, this submission may not work as expected, are you sure?"
    )
    if (confirmSubmit) {
      setIsSubmitting(true)
      submitForm(formData, listing.listingID)
        .then(() => {
          window.alert("Submitted short form application.")
        })
        .catch((error) => {
          console.error("Error submitting application:", error)
        })
        .finally(() => setIsSubmitting(false))
    }
  }

  return (
    <>
      <CardSection>
        <Button variant="text" onClick={handlePrevStep}>
          {t("t.back")}
        </Button>
      </CardSection>
      <CardSection>
        <h1 className="mt-6 mb-4 text-xl md:text-2xl">ListingApplyReviewTerms Component</h1>
      </CardSection>
      <CardSection>
        <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
          {t("t.submit")}
        </Button>
      </CardSection>
    </>
  )
}

export default ListingApplyTerms
