import React, { useContext, useEffect, useState } from "react"
import { t, NavigationContext } from "@bloom-housing/ui-components"
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

interface UrlParams {
  listing: string
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

const InviteToApplyResponse = ({
  listing,
  response,
  deadline,
  submitLink,
  deadlinePassedPath,
}: {
  listing: RailsSaleListing
  response: string
  deadline: string
  submitLink: string
  deadlinePassedPath: boolean
}) => (
  <FormLayout>
    {<InviteToApplyHeader listing={listing} />}
    {response === "contact" && (
      <InviteToApplyContactMeLater listing={listing} deadline={deadline} submitLink={submitLink} />
    )}
    {response === "no" && (
      <InviteToApplyWithdrawn listing={listing} deadline={deadline} submitLink={submitLink} />
    )}
    {deadlinePassedPath && <InviteToApplyDeadlinePassed listing={listing} />}
  </FormLayout>
)

const InviteToApplyPage = ({
  urlParams: { response, applicationNumber, deadline, listing: listingId },
  deadlinePassedPath,
  documentsPath,
}: HomePageProps) => {
  const [listing, setListing] = useState<RailsSaleListing>(null)

  const submitLink = `/invite-to-apply?response=${response}&applicationNumber=${applicationNumber}&deadline=${deadline}&listingId=${listingId}`

  const { router } = useContext(NavigationContext)
  useEffect(() => {
    void getListing(listingId).then((listing: RailsSaleListing) => {
      if (!listing) {
        router.push("/")
      }
      setListing(listing)
    })
  })

  const { unleashFlag: inviteToApplyFlag } = useFeatureFlag("partners.inviteToApply", false)

  if (!inviteToApplyFlag) {
    return null
  }
  if (response === "yes") {
    return <InviteToApplySubmitYourInfo listing={listing} deadline={deadline} />
  } else if (documentsPath) {
    return <InviteToApplyDocuments listing={listing} />
  } else {
    return (
      <InviteToApplyResponse
        listing={listing}
        response={response}
        deadline={deadline}
        submitLink={submitLink}
        deadlinePassedPath={deadlinePassedPath}
      />
    )
  }
}

export default withAppSetup(InviteToApplyPage, { pageName: AppPages.InviteToApply })
