import React, { useContext, useEffect, useState } from "react"
import withAppSetup from "../../layouts/withAppSetup"
import { Cms, CmsContent, CmsItem } from "../../api/types/rails/listings/BaseRailsListing"
import { NavigationContext } from "@bloom-housing/ui-components"
import { getPathWithoutLanguagePrefix } from "../../util/languageUtil"
import { getCms, getListingContent } from "../../api/listingApiService"

interface ApplicationIntroPageProps {
  assetPaths: unknown
}

const ApplicationIntroPage = (_props: ApplicationIntroPageProps) => {
  const { router } = useContext(NavigationContext)
  const [detailUrl, setDetailUrl] = useState<string>("")
  const [reservedQuestion, setReservedQuestion] = useState<string>("")

  useEffect(() => {
    const fetchData = async (listingId) => {
      const response: Cms = await getCms("en")
      const matching: CmsItem[] = response.items.filter(item => item.title === listingId)
      if(matching && matching.length){
        setDetailUrl(matching[0].meta.detail_url)
      }
    }

    const listingId: string = getPathWithoutLanguagePrefix(router.pathname).split("/")[2]
    fetchData(listingId)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      console.log(detailUrl)
      const response: CmsContent = await getListingContent(detailUrl)
      if(response && response.listing_type) {
        setReservedQuestion(response.listing_type.reserved_listing_application_question)
      }
    }

    fetchData()
  }, [detailUrl])

  const display: string = reservedQuestion ? `Questions is: ${reservedQuestion}` : "Data not found in CMS"
  return (
    <div>
        {display}
    </div>
  )
}

export default withAppSetup(ApplicationIntroPage)
