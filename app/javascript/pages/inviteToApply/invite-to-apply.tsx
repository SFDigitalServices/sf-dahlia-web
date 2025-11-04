import React, { useEffect, useState } from "react"
import withAppSetup from "../../layouts/withAppSetup"
import { t, Icon } from "@bloom-housing/ui-components"
import { Card, Button, Heading, Message } from "@bloom-housing/ui-seeds"
import FormLayout from "../../layouts/FormLayout"
import { AppPages } from "../../util/routeUtil"
import InviteToApplyDeadlinePassed from "./InviteToApplyDeadlinePassed"
import { getListing } from "../../api/listingApiService"
import { RailsListing } from "../../modules/listings/SharedHelpers"
import styles from "./InviteToApply.module.scss"
import { localizedFormat, formatTimeOfDay } from "../../util/languageUtil"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"

interface UrlParams {
  listing: string
  response?: string
  applicationNumber?: string
  deadline?: string
}

interface HomePageProps {
  assetPaths: unknown
  urlParams: UrlParams
}

const isDeadlinePassed = (deadline: string) => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  return today > deadlineDate
}

const DeadlinePassedBanner = ({ deadline }: { deadline: string }) => {
  return (
    <Message
      fullwidth
      variant="alert"
      customIcon={<Icon symbol="clock" size="medium" className={styles.bannerIcon} />}
    >
      <strong>{t("inviteToApplyPage.deadlinePassed.banner")}</strong>{" "}
      <span>
        {t("myApplications.applicationDeadlineTime", {
          date: localizedFormat(deadline, "ll"),
          time: formatTimeOfDay(deadline),
        })}
      </span>
    </Message>
  )
}

const InviteToApplyHeader = ({ listing }: { listing: RailsListing }) => (
  <Card className={styles.listingCard}>
    <Card.Header className={styles.listingHeader}>
      <Heading className={styles.listingHeading} priority={1} size="lg">
        {listing?.Name}
      </Heading>
    </Card.Header>
    <Card.Section className={styles.listingSection}>
      <Button href={`/listings/${listing?.Id}`} variant="text" size="sm" newWindowTarget>
        Go to building details
      </Button>
    </Card.Section>
  </Card>
)

const InviteToApplyWithdrawn = () => (
  <div className="mt-4 bg-white rounded-lg border border-solid">
    <div className="pt-8 pb-8 text-center border-b border-solid">
      <div className="text-2xl">Thank you for your response</div>
      <div className="mt-4 text-sm">
        You answered: <span className="font-bold">No, withdraw my application</span>
      </div>
    </div>
  </div>
)

const InviteToApplyPage = (_props: HomePageProps) => {
  const [listing, setListing] = useState<RailsListing>(null)

  useEffect(() => {
    void getListing(_props.urlParams.listing).then((listing: RailsListing) => {
      setListing(listing)
    })
  })

  const { unleashFlag: inviteToApplyFlag } = useFeatureFlag("partners.inviteToApply", false)

  return inviteToApplyFlag ? (
    <FormLayout>
      {!_props.urlParams.response && <InviteToApplyHeader listing={listing} />}
      {_props.urlParams.response && isDeadlinePassed(_props.urlParams.deadline) && (
        <DeadlinePassedBanner deadline={_props.urlParams.deadline} />
      )}
      {_props.urlParams.response === "n" && <InviteToApplyWithdrawn />}
      {window.location.pathname.includes("/deadline-passed") && (
        <InviteToApplyDeadlinePassed
          listingName={listing?.Name}
          leasingAgentName={listing?.Leasing_Agent_Name}
          leasingAgentPhone={listing?.Leasing_Agent_Phone}
          leasingAgentEmail={listing?.Leasing_Agent_Email}
        />
      )}
      {_props.urlParams.response === "e" && <div className="text-2xl">ERROR</div>}
    </FormLayout>
  ) : null
}

export default withAppSetup(InviteToApplyPage, { pageName: AppPages.InviteToApply })
