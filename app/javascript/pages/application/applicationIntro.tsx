import React, { useContext, useEffect, useMemo, useState } from "react"
import withAppSetup from "../../layouts/withAppSetup"
import { Cms, CmsContent, CmsItem } from "../../api/types/rails/listings/BaseRailsListing"
import { NavigationContext } from "@bloom-housing/ui-components"
import { getPathWithoutLanguagePrefix } from "../../util/languageUtil"
import { getCms, getListingContent } from "../../api/listingApiService"
import ReservedQuestion from "./reservedQuestion"
import PersonalInfo from "./personalInfo"
import ContactInfo from "./contactInfo"
import ChooseLanguage from "./chooseLanguage"
import WhatToExpect from "./whatToExpect"

interface ApplicationIntroPageProps {
  assetPaths: unknown
}

const ApplicationIntroPage = (_props: ApplicationIntroPageProps) => {
  const { router } = useContext(NavigationContext)
  const [reservedQuestion, setReservedQuestion] = useState<string>(null)
  const [step, setStep] = useState<number>(0)
  const [currentComponent, setCurrentComponent] = useState(null)
  const [dataLoaded, setDataLoaded] = useState<boolean>(false)
  const stepMapping = useMemo(() => {
    const map = new Map()
    map.set(0, <ChooseLanguage step={step} setStep={setStep} />)
    map.set(
      1,
      <ReservedQuestion reservedQuestion={reservedQuestion} step={step} setStep={setStep} />
    )
    map.set(2, <WhatToExpect step={step} setStep={setStep} />)
    map.set(3, <PersonalInfo step={step} setStep={setStep} />)
    map.set(4, <ContactInfo step={step} setStep={setStep} />)
    return map
  }, [reservedQuestion, step])

  useEffect(() => {
    const fetchContent = async (listingId) => {
      const cmsResponse: Cms = await getCms("en")
      const matching: CmsItem[] = cmsResponse.items.filter((item) => item.title === listingId)
      const detailUrl = matching && matching.length > 0 ? matching[0].meta.detail_url : null

      if (!detailUrl) {
        setReservedQuestion("")
        setDataLoaded(true)
        return
      }

      const contentResponse: CmsContent = await getListingContent(detailUrl)
      if (contentResponse && contentResponse.listing_type) {
        setReservedQuestion(contentResponse.listing_type.reserved_listing_application_question)
      } else {
        setReservedQuestion("")
      }
      setDataLoaded(true)
    }

    const listingId: string = getPathWithoutLanguagePrefix(router.pathname).split("/")[2]
    void fetchContent(listingId)
  }, [router.pathname])

  useEffect(() => {
    if (step === 1 && reservedQuestion === "") {
      const currentStep = step + 1
      setStep(currentStep)
      setCurrentComponent(stepMapping.get(currentStep))
    } else {
      setStep(step)
      setCurrentComponent(stepMapping.get(step))
    }
  }, [reservedQuestion, step, stepMapping, dataLoaded])

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
