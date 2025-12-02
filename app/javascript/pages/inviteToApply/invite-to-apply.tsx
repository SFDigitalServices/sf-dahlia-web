import React, { useContext, useEffect, useState } from "react"
import { t, NavigationContext, Icon, IconFillColors } from "@bloom-housing/ui-components"
import { Card, Button, Heading } from "@bloom-housing/ui-seeds"
import withAppSetup from "../../layouts/withAppSetup"
import FormLayout from "../../layouts/FormLayout"
import { AppPages } from "../../util/routeUtil"
import { getListing } from "../../api/listingApiService"
import { useVariantFlag } from "../../hooks/useFeatureFlag"
import InviteToApplyDeadlinePassed from "./InviteToApplyDeadlinePassed"
import InviteToApplyWithdrawn from "./InviteToApplyWithdrawn"
import InviteToApplyContactMeLater from "./InviteToApplyContactMeLater"
import InviteToApplySubmitYourInfo from "./InviteToApplySubmitYourInfo"
import InviteToApplyDocuments from "./InviteToApplyDocuments"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import styles from "./invite-to-apply.module.scss"
import { getCurrentLanguage, getPathWithoutLanguagePrefix } from "../../util/languageUtil"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"

interface UrlParams {
  response?: string
  applicationNumber?: string
  deadline?: string
}

interface HomePageProps {
  assetPaths: unknown
  urlParams: UrlParams
  deadlinePassedPath?: boolean
  documentsPath?: boolean
}

export const LeasingAgentInfo = ({ listing }: { listing: RailsSaleListing }) => (
  <span>
    <p>{listing?.Leasing_Agent_Name}</p>
    <p className="field-note">{t("inviteToApplyPage.leasingAgent")}</p>
    <a className={styles.responseIcon} href={`tel:+1${listing?.Leasing_Agent_Phone}`}>
      <Icon symbol="phone" size="medium" fill={IconFillColors.primary} />
      {listing?.Leasing_Agent_Phone}
    </a>
    <a className={styles.responseIcon} href={`mailto:${listing?.Leasing_Agent_Email}`}>
      <Icon symbol={faEnvelope} size="medium" fill={IconFillColors.primary} />
      {listing?.Leasing_Agent_Email}
    </a>
  </span>
)

const InviteToApplyHeader = ({ listing }: { listing: RailsSaleListing }) => (
  <Card className={styles.listingCard}>
    <Card.Header className={styles.listingHeader}>
      <Heading className={styles.listingHeading} priority={1} size="lg">
        {listing?.Building_Name_for_Process}
      </Heading>
    </Card.Header>
    <Card.Section className={styles.listingSection}>
      <Button
        className={styles.headerButton}
        href={`/listings/${listing?.Id}`}
        variant="text"
        size="sm"
        newWindowTarget
      >
        {t("inviteToApplyPage.buildingDetails")}
      </Button>
    </Card.Section>
  </Card>
)

const InviteToApplyPage = ({
  urlParams: { response, applicationNumber, deadline },
  deadlinePassedPath,
  documentsPath,
}: HomePageProps) => {
  const [listing, setListing] = useState<RailsSaleListing>(null)

  const submitLink = `/${getCurrentLanguage()}/listings/${listing?.Id}/invite-to-apply?response=yes&applicationNumber=${applicationNumber}&deadline=${deadline}`

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

  const { unleashFlag: inviteApplyFlag, variant } = useVariantFlag("partners.inviteToApply", false)
  const enabledListingIds =
    typeof variant === "object" && variant?.payload?.value ? variant.payload.value.split(",") : []
  const isInviteApplyEnabled =
    inviteApplyFlag && listing?.Id && enabledListingIds.includes(listing.Id)

  if (!isInviteApplyEnabled) {
    return null
  }
  if (response === "yes" || response === "preview") {
    return (
      <InviteToApplySubmitYourInfo
        listing={listing}
        deadline={deadline}
        applicationNumber={applicationNumber}
      />
    )
  } else if (documentsPath) {
    return <InviteToApplyDocuments listing={listing} deadline={deadline} />
  } else {
    return (
      <FormLayout>
        {<InviteToApplyHeader listing={listing} />}
        {response === "contact" && (
          <InviteToApplyContactMeLater
            listing={listing}
            deadline={deadline}
            submitLink={submitLink}
          />
        )}
        {response === "no" && (
          <InviteToApplyWithdrawn listing={listing} deadline={deadline} submitLink={submitLink} />
        )}
        {deadlinePassedPath && <InviteToApplyDeadlinePassed listing={listing} />}
      </FormLayout>
    )
  }
}

export default withAppSetup(InviteToApplyPage, { pageName: AppPages.InviteToApply })
