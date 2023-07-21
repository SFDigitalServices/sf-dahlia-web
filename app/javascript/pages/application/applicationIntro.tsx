import React, { useContext, useEffect, useState } from "react"
import withAppSetup from "../../layouts/withAppSetup"
import { Cms, CmsItem } from "../../api/types/rails/listings/BaseRailsListing"
import axios from "axios"
import { NavigationContext } from "@bloom-housing/ui-components"
import { getPathWithoutLanguagePrefix } from "../../util/languageUtil"

interface ApplicationIntroPageProps {
  assetPaths: unknown
}

const ApplicationIntroPage = (_props: ApplicationIntroPageProps) => {
  const { router } = useContext(NavigationContext)
  const [cmsItem, setCmsItem] = useState<CmsItem>(null)

  useEffect(() => {
    const fetchData = async (listingId) => {
      const response: Cms = await axios.get("http://localhost:8000/api/v2/pages/?locale=en").then(({ data }) => data)
      const matching: CmsItem[] = response.items.filter(item => item.title === listingId)
      setCmsItem(matching[0])
    }

    const listingId: string = getPathWithoutLanguagePrefix(router.pathname).split("/")[2]
    fetchData(listingId)
  }, [])

  const display: string = cmsItem ? `The next step is to call ${cmsItem.meta.detail_url}` : "Data not found in CMS"
  return (
    <div>
        {display}
    </div>
  )
}

export default withAppSetup(ApplicationIntroPage)
