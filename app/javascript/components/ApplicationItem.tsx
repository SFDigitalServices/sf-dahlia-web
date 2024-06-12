import React from "react"
import { t, Button } from "@bloom-housing/ui-components"
import { Card, Link } from "@bloom-housing/ui-seeds"
import "./ApplicationItem.scss"
import { getCurrentLanguage } from "../util/languageUtil"
import { getLocalizedPath } from "../util/routeUtil"

interface ApplicationItemProps {
  applicationDueDate?: string
  applicationURL: string
  applicationUpdatedAt: string
  confirmationNumber?: string
  editedDate?: string
  listingAddress: string
  listingName: string
  listingURL: string
}

const ApplicationItem = (props: ApplicationItemProps) => {
  return (
    <Card.Section className="border-t">
      <header className={"application-item__header"}>
        <h3 className={"application-item__title"}>{props.listingName}</h3>
        {props.applicationDueDate && (
          <p className={"application-item__text"}>
            {t("listings.applicationDeadline")}
            {": "}
            {props.applicationDueDate}
          </p>
        )}
      </header>
      <section className={"application-item__content"}>
        <div className="space-y-2 flex flex-col">
          <p className={"application-item__text"}>{props.listingAddress}</p>
          {props.confirmationNumber && (
            <div className={"application-item__confirm-text"}>
              {t("myApplications.yourLotteryNumberIs", {
                lotteryNumber: props.confirmationNumber,
              })}
            </div>
          )}
          <Link className="text-sm" href={getLocalizedPath(props.listingURL, getCurrentLanguage())}>
            {t("label.seeListing")}
          </Link>
        </div>
        <div className={"application-item__action"}>
          <p className={"application-item__status"}>
            {t("t.status")}
            {": "}
            {t("t.submitted")}
          </p>
          <Button
            onClick={() =>
              (window.location.href = getLocalizedPath(props.applicationURL, getCurrentLanguage()))
            }
          >
            {t("label.viewApplication")}
          </Button>
          <p className={"application-item_edited-text"}>Edited: {props.editedDate}</p>
        </div>
      </section>
    </Card.Section>
  )
}

export { ApplicationItem as default, ApplicationItem }
