import React, { useContext, useEffect, useState } from "react"
import { t, NavigationContext, LoadingOverlay } from "@bloom-housing/ui-components"
import { Card, Button, Heading } from "@bloom-housing/ui-seeds"
import withAppSetup from "../../layouts/withAppSetup"
import FormLayout from "../../layouts/FormLayout"
import { AppPages } from "../../util/routeUtil"
import { getListing } from "../../api/listingApiService"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import InviteToApplyDeadlinePassed from "./InviteToApplyDeadlinePassed"
import InviteToApplyWithdrawn from "./InviteToApplyWithdrawn"
import InviteToApplyContactMeLater from "./InviteToApplyContactMeLater"
import InviteToApplySubmitYourInfo from "./InviteToApplySubmitYourInfo"
import InviteToApplyDocuments from "./InviteToApplyDocuments"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import styles from "./invite-to-apply.module.scss"
import { getPathWithoutLanguagePrefix } from "../../util/languageUtil"

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

const InviteToApplyHeader = ({ listing }: { listing: RailsSaleListing }) => (
  <Card className={styles.listingCard}>
    <Card.Header className={styles.listingHeader}>
      <Heading className={styles.listingHeading} priority={1} size="lg">
        {listing?.Name}
      </Heading>
    </Card.Header>
    <Card.Section className={styles.listingSection}>
      <Button href={`/listings/${listing?.Id}`} variant="text" size="sm" newWindowTarget>
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

  const submitLink = `/invite-to-apply?response="yes"&applicationNumber=${applicationNumber}&deadline=${deadline}&listingId=${listing?.Id}`

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

  const { unleashFlag: inviteToApplyFlag } = useFeatureFlag("partners.inviteToApply", false)

  return inviteToApplyFlag ? (
    <LoadingOverlay isLoading={!listing}>
      {response === "yes" ? (
        <InviteToApplySubmitYourInfo listing={listing} deadline={deadline} />
      ) : (
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
          {documentsPath && <InviteToApplyDocuments listing={listing} />}
        </FormLayout>
      )}
    </LoadingOverlay>
  ) : null
}

export default withAppSetup(InviteToApplyPage, { pageName: AppPages.InviteToApply })
