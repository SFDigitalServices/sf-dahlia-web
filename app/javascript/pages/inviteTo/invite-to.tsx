import React, { useContext, useEffect, useState } from "react"
import { NavigationContext } from "@bloom-housing/ui-components"
import withAppSetup from "../../layouts/withAppSetup"
import { AppPages } from "../../util/routeUtil"
import { getListing } from "../../api/listingApiService"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import InviteToDeadlinePassed from "./InviteToDeadlinePassed"
import InviteToApplyWithdrawn from "./inviteToApply/InviteToApplyWithdrawn"
import InviteToApplyContactMeLater from "./inviteToApply/InviteToApplyContactMeLater"
import InviteToApplySubmitYourInfo from "./inviteToApply/InviteToApplySubmitYourInfo"
import InviteToApplyDocuments from "./inviteToApply/InviteToApplyDocuments"
import InviteToInterviewDocuments from "./inviteToInterview/InviteToInterviewDocuments"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import { getCurrentLanguage, getPathWithoutLanguagePrefix } from "../../util/languageUtil"
import { isDeadlinePassed } from "../../util/listingUtil"

interface UrlParams {
  type: string
  deadline: string
  action: string
  appId: string
}

interface HomePageProps {
  assetPaths: unknown
  urlParams: UrlParams
  submitPreviewLinkTokenParam?: string
  deadlinePassedPath?: boolean
  documentsPath?: boolean
  fileUploadUrl?: string
}

const InviteToPage = ({
  urlParams: { type, deadline, action, appId },
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
  const { unleashFlag: isInviteToInterviewEnabled } = useFeatureFlag("all.i2i", false)

  const generateSubmitLink = () => {
    const submitLinkQueryStr = submitPreviewLinkTokenParam
      ? `t=${submitPreviewLinkTokenParam}`
      : new URLSearchParams({ appId, deadline }).toString()
    return `/${getCurrentLanguage()}/listings/${listing?.Id}/invite-to-apply?${submitLinkQueryStr}`
  }

  if (type === "I2I") {
    if (!isInviteToInterviewEnabled) {
      return null
    }
    return <InviteToInterviewDocuments listing={listing} />
  }

  if (!isInviteApplyEnabled) {
    return null
  }

  if (documentsPath) {
    return <InviteToApplyDocuments listing={listing} />
  }

  // invitee has not responded, they are merely previewing the submit page
  if (action === "preview") {
    return (
      <InviteToApplySubmitYourInfo
        listing={listing}
        deadline={deadline}
        applicationNumber={appId}
        fileUploadUrl={fileUploadUrl}
      />
    )
  }

  if (action === "no") {
    return (
      <InviteToApplyWithdrawn
        listing={listing}
        deadline={deadline}
        submitPreviewLink={generateSubmitLink()}
      />
    )
  }

  if (isDeadlinePassed(deadline)) {
    return <InviteToDeadlinePassed listing={listing} />
  }

  if (action === "yes") {
    return (
      <InviteToApplySubmitYourInfo
        listing={listing}
        deadline={deadline}
        applicationNumber={appId}
        fileUploadUrl={fileUploadUrl}
      />
    )
  }
  if (action === "contact") {
    return (
      <InviteToApplyContactMeLater
        listing={listing}
        deadline={deadline}
        submitPreviewLink={generateSubmitLink()}
      />
    )
  }
}

export default withAppSetup(InviteToPage, { pageName: AppPages.InviteTo })
