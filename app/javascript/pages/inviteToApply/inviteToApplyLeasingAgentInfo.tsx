import React from "react"
import { t, Icon, IconFillColors } from "@bloom-housing/ui-components"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import styles from "./invite-to-apply.module.scss"

const InviteToApplyLeasingAgentInfo = ({ listing }: { listing: RailsSaleListing }) => (
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

export default InviteToApplyLeasingAgentInfo
