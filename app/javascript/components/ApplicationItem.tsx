import React from "react"
import {
  t,
  AppearanceStyleType,
  LinkButton,
  AppearanceSizeType,
  Button,
} from "@bloom-housing/ui-components"
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
  handleDeleteApp?: (id: string) => void
}

const ApplicationItem = (props: ApplicationItemProps) => {
  const ApplicationButton = (url: string, text: string, style?: AppearanceStyleType) => (
    <LinkButton
      size={AppearanceSizeType.small}
      styleType={style}
      href={getLocalizedPath(url, getCurrentLanguage())}
    >
      {text}
    </LinkButton>
  )
  const classNames = ["application-item"]
  if (!props.submitted) classNames.push("application-item__bg")

  return (
    <Card.Section className={classNames.join(" ")}>
      <header className={"application-item__header"}>
        <h3 className={"application-item__title"}>{props.listingName}</h3>
        {props.applicationDueDate && (
          <p className={"application-item__text"}>
            {`${t("listings.applicationDeadline")}: ${props.applicationDueDate}`}
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
          <div className={"application-item__status"}>
            {`${t("t.status")}: `}
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
          </div>
          {props.submitted &&
            !props.lotteryComplete &&
            ApplicationButton(props.applicationURL, t("label.viewApplication"))}
          {props.submitted &&
            props.lotteryComplete &&
            props.lotteryError &&
            ApplicationButton(
              props.lotteryResultsURL,
              t("listings.downloadLotteryResults"),
              AppearanceStyleType.primary
            )}
          {props.submitted &&
            props.lotteryComplete &&
            !props.lotteryError &&
            ApplicationButton(
              props.applicationURL,
              t("listings.viewLotteryResults"),
              AppearanceStyleType.primary
            )}
          {!props.submitted &&
            !props.pastDue &&
            ApplicationButton(
              props.applicationURL,
              t("label.continueApplication"),
              AppearanceStyleType.primary
            )}
        </div>
      </section>
      <div className={"application-item__footer"}>
        <span className="text-sm inline-block space-x-3">
          <Link href={getLocalizedPath(props.listingURL, getCurrentLanguage())}>
            {t("label.seeListing")}
          </Link>
          {!props.submitted && (
            <Button
              unstyled
              className={"application-item__delete"}
              onClick={() => {
                props.handleDeleteApp("test-id")
              }}
            >
              {t("t.delete")}
            </Button>
          )}
        </span>
        <span className={"application-item_edited-text"}>
          {`${t("label.edited")}: ${props.editedDate}`}
        </span>
      </div>
    </Card.Section>
  )
}

export { ApplicationItem as default, ApplicationItem }
