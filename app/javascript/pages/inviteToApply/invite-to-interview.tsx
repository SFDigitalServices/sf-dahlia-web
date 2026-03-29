import React, { useContext, useEffect, useState } from "react"
import { NavigationContext } from "@bloom-housing/ui-components"
import withAppSetup from "../../layouts/withAppSetup"
import { AppPages } from "../../util/routeUtil"
import { getListing } from "../../api/listingApiService"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import InviteToInterviewDocuments from "./InviteToInterviewDocuments"
import InviteToInterviewSubmitYourInfo from "./InviteToInterviewSubmitYourInfo"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import { getPathWithoutLanguagePrefix } from "../../util/languageUtil"

interface UrlParams {
  deadline?: string
  response?: string
  applicationNumber?: string
}

interface InviteToInterviewPageProps {
  assetPaths: unknown
  urlParams?: UrlParams
  documentsPath?: boolean
}

const InviteToInterviewPage = ({ urlParams, documentsPath }: InviteToInterviewPageProps) => {
  const [listing, setListing] = useState<RailsSaleListing>(null)
  const { router } = useContext(NavigationContext)

  useEffect(() => {
    const path = getPathWithoutLanguagePrefix(router.pathname)
    void getListing(path.split("/")[2]).then((listing: RailsSaleListing) => {
      if (!listing) {
        router.push("/")
      }
      setListing(listing)
    })
  }, [router, router.pathname])

  const { unleashFlag: isInviteInterviewEnabled } = useFeatureFlag(
    "partners.inviteToInterview",
    false
  )

  if (!isInviteInterviewEnabled) {
    return null
  }

  if (documentsPath) {
    return <InviteToInterviewDocuments listing={listing} />
  }

  return (
    <InviteToInterviewSubmitYourInfo
      listing={listing}
      deadline={urlParams?.deadline}
    />
  )
}

export default withAppSetup(InviteToInterviewPage, { pageName: AppPages.InviteToInterview })
