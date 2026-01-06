import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Card, Button, Heading } from "@bloom-housing/ui-seeds"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import styles from "./invite-to-apply.module.scss"

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

export default InviteToApplyHeader
