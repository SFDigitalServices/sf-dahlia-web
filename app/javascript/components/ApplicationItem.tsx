import React from "react"
import {
  t,
  AppearanceStyleType,
  LinkButton,
  AppearanceSizeType,
  Button,
  Modal,
} from "@bloom-housing/ui-components"
import { Card, Link } from "@bloom-housing/ui-seeds"
import "./ApplicationItem.scss"
import { formatTimeOfDay, getCurrentLanguage, localizedFormat } from "../util/languageUtil"
import { getListingDetailPath, getLocalizedPath } from "../util/routeUtil"
import { RailsListing } from "../modules/listings/SharedHelpers"
import {
  getListingAddressString,
  isLotteryComplete,
  showLotteryResultsPDFonly,
} from "../util/listingUtil"
import { RailsLotteryResult } from "../api/types/rails/listings/RailsLotteryResult"
import { getLotteryBucketDetails } from "../api/listingApiService"
import { ListingDetailsLotterySearchForm } from "../modules/listingDetailsLottery/ListingDetailsLotterySearchForm"

interface ApplicationItemProps {
  applicationURL: string
  applicationUpdatedAt: string
  confirmationNumber?: string
  editedDate?: string
  submitted: boolean
  handleDeleteApp?: (id: string) => void
  listing: RailsListing
  lotteryResultsURL?: string
}

const ApplicationItem = (props: ApplicationItemProps) => {
  const [lotteryBucketDetails, setLotteryBucketDetails] = React.useState<RailsLotteryResult>()
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const applicationDueDate = props.listing.Application_Due_Date
  const listingAddress = getListingAddressString(props.listing)
  const listingName = props.listing.Name
  const listingURL = `${getListingDetailPath()}/${props.listing.listingID}`
  const lotteryComplete = isLotteryComplete(props.listing)
  const pastDue = new Date() > new Date(props.listing.Application_Due_Date)
  const applicationID = props.applicationURL.split("/").pop()

  React.useEffect(() => {
    if (isLotteryComplete(props.listing)) {
      void getLotteryBucketDetails(props.listing.Id).then((lotteryBucketDetails) => {
        setLotteryBucketDetails(lotteryBucketDetails)
      })
    }
  }, [props.listing, props.listing.Id])

  const ApplicationButton = (
    url: string,
    text: string,
    style?: AppearanceStyleType,
    newTab?: boolean
  ) => (
    <LinkButton
      size={AppearanceSizeType.small}
      styleType={style}
      href={getLocalizedPath(url, getCurrentLanguage())}
      newTab={newTab}
      className="text-11"
    >
      {text}
    </LinkButton>
  )
  const classNames = ["application-item"]
  if (!props.submitted) classNames.push("application-item__bg")

  return (
    <>
      <Card.Section className={classNames.join(" ")}>
        <header className={"application-item__header"} data-testid="application-item">
          <h3 className={"application-item__title"}>{listingName}</h3>
          {applicationDueDate && (
            <>
              <div className={"application-item__text"}>
                <p>{t("myApplications.applicationDeadline")}</p>
                <p>
                  {t("myApplications.applicationDeadlineTime", {
                    date: localizedFormat(applicationDueDate, "ll"),
                    time: formatTimeOfDay(applicationDueDate),
                  })}
                </p>
              </div>
            </>
          )}
        </header>
        <section className={"application-item__content"}>
          <div className="w-full mb-3">
            <p className={"application-item__text text-left w-full"}>{listingAddress}</p>
            {props.confirmationNumber && props.submitted && (
              <div className={"application-item__confirm-text"}>
                {lotteryComplete ? (
                  <span>
                    {t("myApplications.yourLotteryNumberIs.withLink")}{" "}
                    {showLotteryResultsPDFonly(props.listing) ? (
                      <Link
                        href={props.listing.LotteryResultsURL}
                      >{`#${props.confirmationNumber}`}</Link>
                    ) : (
                      <button
                        className="text-blue-500"
                        onClick={() => setIsModalOpen(true)}
                      >{`#${props.confirmationNumber}`}</button>
                    )}
                  </span>
                ) : (
                  t("myApplications.yourLotteryNumberIs", {
                    lotteryNumber: props.confirmationNumber,
                  })
                )}
              </div>
            )}
          </div>
          <div className={"application-item__action"}>
            <div className={"application-item__status"}>
              {`${t("t.status")}: `}
              {props.submitted && !lotteryComplete && (
                <span className={"submitted"}>{t("myApplications.status.submitted")}</span>
              )}
              {!props.submitted && !pastDue && t("myApplications.status.inProgress")}
              {props.submitted && lotteryComplete && (
                <span className={"submitted"}>{t("myApplications.status.resultsPosted")}</span>
              )}
              {!props.submitted && pastDue && (
                <span className={"never-submitted"}>
                  {t("myApplications.status.neverSubmitted")}
                </span>
              )}
            </div>
            {props.submitted &&
              !lotteryComplete &&
              ApplicationButton(props.applicationURL, t("label.viewApplication"))}
            {props.submitted &&
              lotteryComplete &&
              (showLotteryResultsPDFonly(props.listing) ? (
                ApplicationButton(
                  props.listing.LotteryResultsURL,
                  t("listings.lottery.downloadLotteryResults"),
                  AppearanceStyleType.primary,
                  true
                )
              ) : (
                <Button
                  size={AppearanceSizeType.small}
                  styleType={AppearanceStyleType.primary}
                  className="text-11"
                  onClick={() => {
                    setIsModalOpen(true)
                  }}
                >
                  {t("listings.lottery.viewLotteryResults")}
                </Button>
              ))}
            {!props.submitted &&
              !pastDue &&
              ApplicationButton(
                `/listings/${props.listing.listingID}/apply/name`,
                t("label.continueApplication"),
                AppearanceStyleType.primary
              )}
          </div>
        </section>
        <div className={"application-item__footer"}>
          <span className="text-sm inline-block space-x-3">
            <Link href={getLocalizedPath(listingURL, getCurrentLanguage())}>
              {t("myApplications.seeListing")}
            </Link>
            {props.submitted && lotteryComplete && (
              <Link href={props.applicationURL}>{t("myApplications.viewApplication")}</Link>
            )}
            {!props.submitted && (
              <Button
                unstyled
                className={"application-item__delete"}
                onClick={() => {
                  props.handleDeleteApp(applicationID)
                }}
                ariaLabel={t("accountSettings.deleteAria", { listing: props.listing.Name })}
              >
                {t("t.delete")}
              </Button>
            )}
          </span>
          <span className={"application-item_edited-text"}>
            {t("label.edited")}: {localizedFormat(props.editedDate, "ll")}
          </span>
        </div>
      </Card.Section>
      {lotteryBucketDetails && !showLotteryResultsPDFonly(props.listing) && (
        <Modal
          onClose={() => setIsModalOpen(false)}
          open={isModalOpen}
          role="alertdialog"
          title=""
          modalClassNames="md:max-w-0 w-screen"
          innerClassNames="p-0"
          closeClassNames="z-50"
          scrollable
        >
          <ListingDetailsLotterySearchForm
            listing={props.listing}
            lotteryBucketDetails={lotteryBucketDetails}
            lotteryNumber={props.confirmationNumber}
          />
        </Modal>
      )}
    </>
  )
}

export { ApplicationItem as default, ApplicationItem }
