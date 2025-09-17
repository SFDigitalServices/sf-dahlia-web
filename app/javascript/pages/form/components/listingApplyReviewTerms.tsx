import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button } from "@bloom-housing/ui-seeds"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { useFormEngineContext } from "../../../formEngine/formEngineContext"
import { submitForm } from "../../../api/formApiService"

const ListingApplyReviewTerms = () => {
  const formEngineContext = useFormEngineContext()
  const { handlePrevStep, formData } = formEngineContext
  const handleSubmit = () => {
    submitForm(formData)
      .then(() => {
        console.log("Submitted short form application.")
      })
      .catch((error) => {
        console.error("Error submitting application:", error)
      })
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
        <Button variant="primary" onClick={handleSubmit}>
          {t("t.submit")}
        </Button>
      </CardSection>
    </>
  )
}

export default ListingApplyReviewTerms
