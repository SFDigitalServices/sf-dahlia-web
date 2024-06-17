import React from "react"
import { t, Button, AppearanceStyleType } from "@bloom-housing/ui-components"
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
  lotteryComplete: boolean
  lotteryError?: boolean
  lotteryResultsURL?: string
  submitted: boolean
  pastDue?: boolean
}

const ApplicationItem = (props: ApplicationItemProps) => {
  const classNames = ["application-item"]
  if (!props.submitted) classNames.push("application-item__bg")
  return (
    <Card.Section className={classNames.join(" ")}>
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
        <div className="space-y-2">
          <p className={"application-item__text"}>{props.listingAddress}</p>
          {props.confirmationNumber && props.submitted && (
            <div className={"application-item__confirm-text"}>
              {t("myApplications.yourLotteryNumberIs", {
                lotteryNumber: props.confirmationNumber,
              })}
            </div>
          )}
        </div>
        <div className={"application-item__action"}>
          <p className={"application-item__status"}>
            {t("t.status") + ": "}
            {props.submitted && !props.lotteryComplete && (
              <span className={"submitted"}>{t("t.submitted")}</span>
            )}
            {!props.submitted && !props.pastDue && t("t.inProgress")}
            {props.submitted && props.lotteryComplete && (
              <span className={"submitted"}>{t("myApplications.resultsPosted")}</span>
            )}
            {!props.submitted && props.pastDue && (
              <span className={"never-submitted"}>{t("t.neverSubmitted")}</span>
            )}
          </p>
          {props.submitted && !props.lotteryComplete && (
            <Button
              onClick={() =>
                (window.location.href = getLocalizedPath(
                  props.applicationURL,
                  getCurrentLanguage()
                ))
              }
            >
              {t("label.viewApplication")}
            </Button>
          )}
          {props.submitted && props.lotteryComplete && props.lotteryError && (
            <Button
              className={AppearanceStyleType.primary}
              onClick={() =>
                (window.location.href = getLocalizedPath(
                  props.lotteryResultsURL,
                  getCurrentLanguage()
                ))
              }
            >
              {t("listings.downloadLotteryResults")}
            </Button>
          )}
          {props.submitted && props.lotteryComplete && !props.lotteryError && (
            <Button
              className={AppearanceStyleType.primary}
              onClick={() =>
                (window.location.href = getLocalizedPath(
                  props.applicationURL,
                  getCurrentLanguage()
                ))
              }
            >
              {t("listings.viewLotteryResults")}
            </Button>
          )}
          {!props.submitted && !props.pastDue && (
            <Button
              className={AppearanceStyleType.primary}
              onClick={() =>
                (window.location.href = getLocalizedPath(
                  props.applicationURL,
                  getCurrentLanguage()
                ))
              }
            >
              {t("label.continueApplication")}
            </Button>
          )}
        </div>
      </section>
      <div className={"application-item__footer"}>
        <span className="text-sm inline-block space-x-3">
          <Link href={getLocalizedPath(props.listingURL, getCurrentLanguage())}>
            {t("label.seeListing")}
          </Link>
          {/* TODO: Add functionality to delete application in Link href */}
          {!props.submitted && (
            <Link className={"application-item__delete"} href={""}>
              {t("t.delete")}
            </Link>
          )}
        </span>
        <span className={"application-item_edited-text"}>
          {t("label.edited") + ": "}
          {props.editedDate}
        </span>
      </div>
    </Card.Section>
  )
}

export { ApplicationItem as default, ApplicationItem }
