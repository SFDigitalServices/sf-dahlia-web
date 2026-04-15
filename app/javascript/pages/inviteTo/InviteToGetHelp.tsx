import React from "react"
import { t, Icon, IconFillColors } from "@bloom-housing/ui-components"
import { Heading } from "@bloom-housing/ui-seeds"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { renderInlineMarkup } from "../../util/languageUtil"

import styles from "./invite-to.module.scss"
import { HOME_SF_PHONE } from "../../modules/constants"

const InviteToGetHelp = () => (
  <div className={styles.submitYourInfoBox}>
    <Heading priority={3} size="lg">
      {t("inviteToApplyPage.submitYourInfo.prepare.p2")}
    </Heading>
    <p>{t("inviteToApplyPage.submitYourInfo.prepare.p3")}</p>
    {renderInlineMarkup(t("inviteToApplyPage.submitYourInfo.prepare.p4"))}
    <span className={styles.submitYourInfoIcons}>
      <a className={styles.responseIcon} href={`tel:+1${HOME_SF_PHONE}`}>
        <Icon symbol="phone" size="medium" fill={IconFillColors.primary} />
        {HOME_SF_PHONE}
      </a>
      <a className={styles.responseIcon} href={`mailto:${"info@homesanfrancisco.org"}`}>
        <Icon symbol={faEnvelope} size="medium" fill={IconFillColors.primary} />
        {"info@homesanfrancisco.org"}
      </a>
    </span>
  </div>
)

export default InviteToGetHelp
