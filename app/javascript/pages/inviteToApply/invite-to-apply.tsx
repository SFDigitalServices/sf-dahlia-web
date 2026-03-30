import React, { useContext, useEffect, useState } from "react"
import { NavigationContext } from "@bloom-housing/ui-components"
import withAppSetup from "../../layouts/withAppSetup"
import { AppPages } from "../../util/routeUtil"
import { getListing } from "../../api/listingApiService"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import InviteToApplyDeadlinePassed from "./InviteToApplyDeadlinePassed"
import InviteToApplyWithdrawn from "./InviteToApplyWithdrawn"
import InviteToApplyContactMeLater from "./InviteToApplyContactMeLater"
import InviteToApplySubmitYourInfo from "./InviteToApplySubmitYourInfo"
import InviteToApplyDocuments from "./InviteToApplyDocuments"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import { getCurrentLanguage, getPathWithoutLanguagePrefix } from "../../util/languageUtil"
import { isDeadlinePassed } from "../../util/listingUtil"

interface UrlParams {
  response?: string
  applicationNumber?: string
  deadline?: string
}

interface HomePageProps {
  assetPaths: unknown
  urlParams: UrlParams
  submitPreviewLinkTokenParam?: string
  deadlinePassedPath?: boolean
  documentsPath?: boolean
  fileUploadUrl?: string
}

const InviteToApplyPage = ({
  urlParams: { response, applicationNumber, deadline },
  submitPreviewLinkTokenParam,
  documentsPath,
  fileUploadUrl,
}: HomePageProps) => {
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

  const { unleashFlag: isInviteApplyEnabled } = useFeatureFlag("partners.inviteToApply", false)

  const generateSubmitLink = () => {
    const submitLinkQueryStr = submitPreviewLinkTokenParam
      ? `t=${submitPreviewLinkTokenParam}`
      : new URLSearchParams({ applicationNumber, deadline }).toString()
    return `/${getCurrentLanguage()}/listings/${listing?.Id}/invite-to-apply?${submitLinkQueryStr}`
  }

  if (!isInviteApplyEnabled) {
    return null
  }

  if (documentsPath) {
    return <InviteToApplyDocuments listing={listing} />
  }

  // invitee has not responded, they are merely previewing the submit page
  if (!response) {
    return (
      <InviteToApplySubmitYourInfo
        listing={listing}
        deadline={deadline}
        applicationNumber={applicationNumber}
        fileUploadUrl={fileUploadUrl}
      />
    )
  }

  if (response === "no") {
    return (
      <InviteToApplyWithdrawn
        listing={listing}
        deadline={deadline}
        submitPreviewLink={generateSubmitLink()}
      />
    )
  }

  if (isDeadlinePassed(deadline)) {
    return <InviteToApplyDeadlinePassed listing={listing} />
  }

  if (response === "yes") {
    return (
      <InviteToApplySubmitYourInfo
        listing={listing}
        deadline={deadline}
        applicationNumber={applicationNumber}
        fileUploadUrl={fileUploadUrl}
      />
    )
  }
  if (response === "contact") {
    return (
      <InviteToApplyContactMeLater
        listing={listing}
        deadline={deadline}
        submitPreviewLink={generateSubmitLink()}
      />
    )
  }
}

export default withAppSetup(InviteToApplyPage, { pageName: AppPages.InviteToApply })
