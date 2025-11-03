import React from "react"
import { t } from "@bloom-housing/ui-components"
import styles from "./InviteToApplyDeadlinePassed.module.scss"

interface InviteToApplyDeadlinePassedProps {
    listingName: string
    leasingAgentName: string
    leasingAgentPhone: string
    leasingAgentEmail: string
}

const InviteToApplyDeadlinePassed = ({ listingName, leasingAgentName, leasingAgentPhone, leasingAgentEmail }: InviteToApplyDeadlinePassedProps) => {
    return (
        <div className="mt-4 bg-white rounded-lg border border-solid">
          <div className="pt-8 pb-8 text-center border-b border-solid">
            <div className="text-2xl">{t("inviteToApplyPage.deadlinePassed.title")}</div>
            <div className="mt-4 text-sm">{t("inviteToApplyPage.deadlinePassed.subtitle")}</div>
          </div>
          <div className="p-8 bg-blue-100">
            <p>
              {t("inviteToApplyPage.deadlinePassed.p1", { listingName: listingName })}
              <span className="text-neutral-600">, {t("inviteToApplyPage.deadlinePassed.p2")}: </span>
            </p>
            <ul className="mt-6">
              <li>
                <span className="text-lg leading-6">
                  {leasingAgentName}
                </span>
              </li>
              <li>
                <a href={`tel:${leasingAgentPhone}`}>
                  {leasingAgentPhone}
                </a>
              </li>
              <li>
                <a href={`mailto:${leasingAgentEmail}`}>
                  {leasingAgentEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>
    )
}

export default InviteToApplyDeadlinePassed