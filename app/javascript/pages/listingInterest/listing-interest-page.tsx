import React, { useEffect, useState } from "react"
import withAppSetup from "../../layouts/withAppSetup"
import { Card, Button, Heading } from "@bloom-housing/ui-seeds"
import FormLayout from "../../layouts/FormLayout"
import Link from "../../navigation/Link"
import { AppPages } from "../../util/routeUtil"
import InviteToApplyDeadlinePassed from "./InviteToApplyDeadlinePassed"
import { getListing } from "../../api/listingApiService"
import { RailsListing } from "../../modules/listings/SharedHelpers"
import styles from "./InviteToApply.module.scss"

interface UrlParams {
  listing: string
  response: string
}

interface HomePageProps {
  assetPaths: unknown
  urlParams: UrlParams
}

const ListingInterestPage = (_props: HomePageProps) => {
  const [listing, setListing] = useState<RailsListing>(null)
  useEffect(() => {
    void getListing(_props.urlParams.listing).then((listing: RailsListing) => {
      setListing(listing)
    })
  }, [_props.urlParams.listing])
  return (
    <FormLayout>
      {_props.urlParams.response !== "e" && (
        <Card className={styles.listingCard}>
          <Card.Header className={styles.listingHeader}>
            <Heading className={styles.listingHeading} priority={1} size="lg">{listing?.Name}</Heading>
          </Card.Header>
          <Card.Section className={styles.listingSection}>
            <Button href={`/listings/${listing?.Id}`} variant="text" size="sm" newWindowTarget>
              Go to building details
            </Button>
          </Card.Section>
        </Card>
      )}
      {_props.urlParams.response === "y" && (
        <div className="mt-4 bg-white rounded-lg border border-solid">
          <div className="pt-8 pb-8 text-center border-b border-solid">
            <div className="text-2xl">Thank you for your response</div>
            <div className="mt-4 text-sm">
              You answered: <span className="font-bold">Yes, I'm still interested</span>
            </div>
          </div>
          <div className="p-8 bg-blue-100">
            <span className="font-bold">What to expect</span>
            <ul className="p-4 space-y-4 list-disc">
              <li>
                The leasing agent will contact you when it's your turn to move forward with your
                application.
              </li>
              <li>We will send you an email to let you know once all units get leased.</li>
              <li>
                We will contact you again if more units become available in the next 12 months.
              </li>
            </ul>
            <Link external href="https://www.sf.gov/after-rental-housing-lottery" target="_blank">
              Learn more about what happens after the housing lottery.
            </Link>
          </div>
        </div>
      )}
      {_props.urlParams.response === "n" && (
        <div className="mt-4 bg-white rounded-lg border border-solid">
          <div className="pt-8 pb-8 text-center border-b border-solid">
            <div className="text-2xl">Thank you for your response</div>
            <div className="mt-4 text-sm">
              You answered: <span className="font-bold">No, withdraw my application</span>
            </div>
          </div>
        </div>
      )}
      {_props.urlParams.response === "x" && (
        <InviteToApplyDeadlinePassed
          listingName={listing?.Name}
          leasingAgentName={listing?.Leasing_Agent_Name}
          leasingAgentPhone={listing?.Leasing_Agent_Phone}
          leasingAgentEmail={listing?.Leasing_Agent_Email}
        />
      )}
      {_props.urlParams.response === "e" && (
        <div className="mt-4 bg-white rounded-lg border border-solid">
          <div className="pt-8 pb-8 text-center border-b border-solid">
            <div className="text-2xl">ERROR</div>
            <div className="mt-4 text-sm">INVALID REQUEST</div>
          </div>
        </div>
      )}
    </FormLayout>
  )
}

export default withAppSetup(ListingInterestPage, { pageName: AppPages.ListingInterest })
