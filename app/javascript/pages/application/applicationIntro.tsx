import React, { useContext, useEffect, useMemo, useState } from "react"
import withAppSetup from "../../layouts/withAppSetup"
import { Cms, CmsContent, CmsItem } from "../../api/types/rails/listings/BaseRailsListing"
import { NavigationContext } from "@bloom-housing/ui-components"
import { getPathWithoutLanguagePrefix } from "../../util/languageUtil"
import { getCms, getListingContent } from "../../api/listingApiService"
import ReservedQuestion from "./reservedQuestion"
import PersonalInfo from "./personalInfo"
import ContactInfo from "./contactInfo"

interface ApplicationIntroPageProps {
  assetPaths: unknown
}

const ApplicationIntroPage = (_props: ApplicationIntroPageProps) => {
  const { router } = useContext(NavigationContext)
  const [detailUrl, setDetailUrl] = useState<string>("")
  const [reservedQuestion, setReservedQuestion] = useState<string>(null)
  const [step, setStep] = useState<number>(0)
  const [currentComponent, setCurrentComponent] = useState(null)
  const stepMapping = useMemo(() => {
    const map = new Map()
    map.set(
      0,
      <ReservedQuestion reservedQuestion={reservedQuestion} step={step} setStep={setStep} />
    )
    map.set(1, <PersonalInfo step={step} setStep={setStep} />)
    map.set(2, <ContactInfo />)
    return map
  }, [reservedQuestion, step])

  useEffect(() => {
    const fetchData = async (listingId) => {
      const response: Cms = await getCms("en")
      const matching: CmsItem[] = response.items.filter((item) => item.title === listingId)
      if (matching && matching.length > 0) {
        setDetailUrl(matching[0].meta.detail_url)
      }
    }

    const listingId: string = getPathWithoutLanguagePrefix(router.pathname).split("/")[2]
    void fetchData(listingId)
  }, [router.pathname])

  useEffect(() => {
    const fetchData = async () => {
      const response: CmsContent = await getListingContent(detailUrl)
      if (response && response.listing_type) {
        setReservedQuestion(response.listing_type.reserved_listing_application_question)
      } else {
        setReservedQuestion("")
      }
    }

    void fetchData()
  }, [detailUrl])

  useEffect(() => {
    if (reservedQuestion) {
      if (step === 0 && reservedQuestion === "") {
        console.log("no data")
        const currentStep = step + 1
        setStep(currentStep)
        setCurrentComponent(stepMapping.get(currentStep))
      } else {
        console.log("data")
        setStep(step)
        setCurrentComponent(stepMapping.get(step))
      }
    }
  }, [reservedQuestion, step, stepMapping])

  const display: string = reservedQuestion
    ? `Questions is: ${reservedQuestion}`
    : "Data not found in CMS"

  return (
    <div>
      {display}
      {currentComponent}
    </div>
  )
}

export default withAppSetup(ApplicationIntroPage)
