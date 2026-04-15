import React, { useContext, useEffect, useState } from "react"
import { NavigationContext } from "@bloom-housing/ui-components"
import withAppSetup from "../../layouts/withAppSetup"
import { AppPages, generateSubmitLink } from "../../util/routeUtil"
import { getListing } from "../../api/listingApiService"
import { useFeatureFlag, useVariantFlag } from "../../hooks/useFeatureFlag"
import InviteToDeadlinePassed from "./InviteToDeadlinePassed"
import InviteToApplyWithdrawn from "./inviteToApply/InviteToApplyWithdrawn"
import InviteToApplyContactMeLater from "./inviteToApply/InviteToApplyContactMeLater"
import InviteToApplyNextSteps from "./inviteToApply/InviteToApplyNextSteps"
import InviteToApplyDocuments from "./inviteToApply/InviteToApplyDocuments"
import InviteToInterviewDocuments from "./inviteToInterview/InviteToInterviewDocuments"
import InviteToInterviewNextSteps from "./inviteToInterview/InviteToInterviewNextSteps"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import { getPathWithoutLanguagePrefix } from "../../util/languageUtil"
import { isDeadlinePassed } from "../../util/listingUtil"

interface UrlParams {
  type?: "I2A" | "I2I"
  deadline?: string
  inviteAction?: "yes" | "no" | "contact" | "submit" | "appointment"
  appId?: string
  url?: string
}

interface HomePageProps {
  assetPaths: unknown
  urlParams: UrlParams
  submitPreviewLinkTokenParam?: string
  deadlinePassedPath?: boolean
  documentsPath?: boolean
  url?: string
}

const InviteToPage = ({
  urlParams: { type, deadline, inviteAction, appId, url },
  submitPreviewLinkTokenParam,
  documentsPath,
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

  const { unleashFlag: isI2AEnabled } = useFeatureFlag("partners.inviteToApply", false)
  const { unleashFlag: isI2IEnabledFlag, variant } = useVariantFlag("all.i2i", false)
  const enabledListingIds =
    typeof variant === "object" && variant?.payload?.value
      ? JSON.parse(variant.payload.value).enabled_listings
      : []
  const isI2IEnabled = isI2IEnabledFlag && listing?.Id && enabledListingIds.includes(listing.Id)

  /* I2I - Invite to Interview pages */
  if (type === "I2I") {
    if (!isI2IEnabled) {
      return null
    }

    if (documentsPath) return <InviteToInterviewDocuments listing={listing} />
    // no action from applicant - preview submit page
    if (!inviteAction) {
      return <InviteToInterviewNextSteps listing={listing} deadline={deadline} />
    }
    if (inviteAction === "no") {
      return (
        <InviteToApplyWithdrawn
          listing={listing}
          deadline={deadline}
          submitPreviewLink={generateSubmitLink(
            appId,
            deadline,
            listing?.Id,
            submitPreviewLinkTokenParam
          )}
        />
      )
    }
    if (inviteAction === "yes") {
      return <InviteToInterviewNextSteps listing={listing} deadline={deadline} />
    }
    if (isDeadlinePassed(deadline)) return <InviteToDeadlinePassed listing={listing} />
    if (inviteAction === "contact") {
      return (
        <InviteToApplyContactMeLater
          listing={listing}
          deadline={deadline}
          submitPreviewLink={generateSubmitLink(
            appId,
            deadline,
            listing?.Id,
            submitPreviewLinkTokenParam
          )}
        />
      )
    }
  }

  /* I2A - Invite to Apply pages */
  if (!isI2AEnabled) {
    return null
  }

  if (documentsPath) return <InviteToApplyDocuments listing={listing} />
  // no action from applicant - preview submit page
  if (!inviteAction) {
    return (
      <InviteToApplyNextSteps
        listing={listing}
        deadline={deadline}
        appId={appId}
        fileUploadUrl={url}
      />
    )
  }
  if (inviteAction === "no") {
    return (
      <InviteToApplyWithdrawn
        listing={listing}
        deadline={deadline}
        submitPreviewLink={generateSubmitLink(
          appId,
          deadline,
          listing?.Id,
          submitPreviewLinkTokenParam
        )}
      />
    )
  }
  if (inviteAction === "yes") {
    return (
      <InviteToApplyNextSteps
        listing={listing}
        deadline={deadline}
        appId={appId}
        fileUploadUrl={url}
      />
    )
  }
  if (isDeadlinePassed(deadline)) return <InviteToDeadlinePassed listing={listing} />
  if (inviteAction === "contact") {
    return (
      <InviteToApplyContactMeLater
        listing={listing}
        deadline={deadline}
        submitPreviewLink={generateSubmitLink(
          appId,
          deadline,
          listing?.Id,
          submitPreviewLinkTokenParam
        )}
      />
    )
  }
}

export default withAppSetup(InviteToPage, { pageName: AppPages.InviteTo })
