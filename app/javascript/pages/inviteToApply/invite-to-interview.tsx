import React, { useContext, useEffect, useState } from "react"
import { NavigationContext } from "@bloom-housing/ui-components"
import withAppSetup from "../../layouts/withAppSetup"
import { AppPages } from "../../util/routeUtil"
import { getListing } from "../../api/listingApiService"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import InviteToInterviewDocuments from "./InviteToInterviewDocuments"
import InviteToInterviewSubmitYourInfo from "./InviteToInterviewSubmitYourInfo"
import InviteToInterviewWithdrawn from "./InviteToInterviewWithdrawn"
import InviteToInterviewContactMeLater from "./InviteToInterviewContactMeLater"
import InviteToInterviewDeadlinePassed from "./InviteToInterviewDeadlinePassed"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import { getCurrentLanguage, getPathWithoutLanguagePrefix } from "../../util/languageUtil"
import { isDeadlinePassed } from "../../util/listingUtil"

interface UrlParams {
  deadline?: string
  response?: string
  applicationNumber?: string
}

interface InviteToInterviewPageProps {
  assetPaths: unknown
  urlParams?: UrlParams
  submitPreviewLinkTokenParam?: string
  documentsPath?: boolean
}

const InviteToInterviewPage = ({
  urlParams: { response, applicationNumber, deadline } = {},
  submitPreviewLinkTokenParam,
  documentsPath,
}: InviteToInterviewPageProps) => {
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
  const { unleashFlag: jwtLinkParamsFlag } = useFeatureFlag(
    "temp.webapp.inviteToApply.JwtLinkParams",
    false
  )

  const generateSubmitLink = (signLinkParams: boolean) => {
    const submitLinkParams = { applicationNumber, deadline }
    const submitLinkQueryStr =
      signLinkParams && submitPreviewLinkTokenParam
        ? `t=${submitPreviewLinkTokenParam}`
        : new URLSearchParams(submitLinkParams).toString()
    return `/${getCurrentLanguage()}/listings/${listing?.Id}/invite-to-interview?${submitLinkQueryStr}`
  }

  if (!isInviteInterviewEnabled) {
    return null
  }

  if (documentsPath) {
    return <InviteToInterviewDocuments listing={listing} />
  }

  if (!response) {
    return (
      <InviteToInterviewSubmitYourInfo
        listing={listing}
        deadline={deadline}
      />
    )
  }

  if (response === "no") {
    return (
      <InviteToInterviewWithdrawn
        listing={listing}
        deadline={deadline}
        submitPreviewLink={generateSubmitLink(jwtLinkParamsFlag)}
      />
    )
  }

  if (isDeadlinePassed(deadline)) {
    return <InviteToInterviewDeadlinePassed listing={listing} />
  }

  if (response === "yes") {
    return (
      <InviteToInterviewSubmitYourInfo
        listing={listing}
        deadline={deadline}
      />
    )
  }

  if (response === "contact") {
    return (
      <InviteToInterviewWaitlist
        listing={listing}
        deadline={deadline}
        submitPreviewLink={generateSubmitLink(jwtLinkParamsFlag)}
      />
    )
  }
}

export default withAppSetup(InviteToInterviewPage, { pageName: AppPages.InviteToInterview })
