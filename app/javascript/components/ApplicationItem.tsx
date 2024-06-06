import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Button, Card, Tag } from "@bloom-housing/ui-seeds"
import styles from "./ApplicationItem.module.scss"

interface ApplicationItemProps {
  applicationDueDate?: string
  applicationURL: string
  applicationUpdatedAt: string
  confirmationNumber?: string
  listingName: string
  listingURL: string
  strings?: {
    applicationsDeadline?: string
    edited?: string
    seeListing?: string
    status?: string
    submittedStatus?: string
    viewApplication?: string
    yourNumber?: string
  }
}

const ApplicationItem = (props: ApplicationItemProps) => {
  return (
    <Card.Section>
      <article className={styles["application-item"]}>
        <header className={styles["application-item__header"]}>
          <h3 className={styles["application-item__title"]}>{props.listingName}</h3>
          <p className={styles["application-item__status"]}>
            {props.strings?.status ?? t("t.status")}:{" "}
            <Tag variant="primary-inverse">
              {props.strings?.submittedStatus ?? t("application.statuses.submitted")}
            </Tag>
          </p>
        </header>

        <section className={styles["application-item__content"]}>
          <div>
            {props.confirmationNumber && (
              <>
                <span className={styles["application-item__confirm-text"]}>
                  {t("myApplications.yourLotteryNumberIs", {
                    lotteryNumber: props.confirmationNumber,
                  })}
                </span>
                <br />
                <span className={styles["application-item__confirm-number"]}>
                  {props.confirmationNumber}
                </span>
              </>
            )}
          </div>

          <div className={styles["application-item__action"]}>
            {props.applicationDueDate && (
              <p className={styles["application-item__due"]}>
                {props.strings?.applicationsDeadline ?? t("listings.applicationDeadline")}:{" "}
                <span className={styles["application-item__due-date"]}>
                  {props.applicationDueDate}
                </span>
              </p>
            )}
          </div>
        </section>
        <footer className={styles["application-item__footer"]}>
          <div>
            <Button href={props.applicationURL} variant="primary-outlined" size="sm">
              {props.strings?.viewApplication ?? t("label.viewApplication")}
            </Button>
          </div>
          <div>
            <Button href={props.listingURL} variant="primary-outlined" size="sm">
              {props.strings?.seeListing ?? t("label.seeListing")}
            </Button>
          </div>
        </footer>
      </article>
    </Card.Section>
  )
}

export { ApplicationItem as default, ApplicationItem }
