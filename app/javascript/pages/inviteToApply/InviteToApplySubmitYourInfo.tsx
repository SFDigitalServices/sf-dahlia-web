import React from "react"
import { Icon, t } from "@bloom-housing/ui-components"
import { Heading, Button, Message } from "@bloom-housing/ui-seeds"
import HeaderSidebarLayout from "../../layouts/HeaderSidebarLayout"
import RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import { getListingAddressString } from "../../util/listingUtil"
import { LeasingAgent } from "../../modules/listings/components/LeasingAgent"
import { getApplicationDeadline } from "../../util/languageUtil"
import styles from "./InviteToApply.module.scss"

interface InviteToApplySubmitYourInfoProps {
  listing: RailsSaleListing
  deadline: string
}

const DeadlineBanner = ({ deadline }: { deadline: string }) => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const isDeadlinePassed = today > deadlineDate
  return (
    <Message
      fullwidth
      variant={isDeadlinePassed ? "alert" : "warn"}
      customIcon={<Icon symbol="clock" size="medium" />}
    >
      <strong>
        {isDeadlinePassed
          ? t("inviteToApplyPage.submitYourInfo.deadlinePassed")
          : t("inviteToApplyPage.submitYourInfo.submitByDeadline")}
      </strong>
      <span>{getApplicationDeadline(deadline)}</span>
    </Message>
  )
}

const PreparingYourApplication = () => {
  return (
    <>
      <Heading priority={2}>{t("inviteToApplyPage.submitYourInfo.title")}</Heading>
      <p>{t("inviteToApplyPage.submitYourInfo.p2")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.prepare.p1")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.prepare.p2")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.prepare.p3")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.prepare.p4")}</p>
      <Button>{t("inviteToApplyPage.submitYourInfo.prepare.p5")}</Button>
    </>
  )
}

const WhatToDo = () => {
  return (
    <>
      <Heading priority={2}>{t("inviteToApplyPage.submitYourInfo.title")}</Heading>
      <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step1.p1")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step1.p2")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step1.p3")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step2.p1")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step2.p2")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step2.p3")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p1")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p2")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p3")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p4")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p5")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p6")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p7")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p8")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatToDo.step3.p9")}</p>
    </>
  )
}

const WhatHappensNext = () => {
  return (
    <>
      <Heading priority={2}>{t("howToApplyPage.whatHappensNext.title")}</Heading>
      <p>{t("inviteToApplyPage.submitYourInfo.whatHappensNext.p1")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatHappensNext.p2")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatHappensNext.p3")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatHappensNext.p4")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatHappensNext.p5")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatHappensNext.p6")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatHappensNext.p7")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.whatHappensNext.p8")}</p>
    </>
  )
}

const SubmitYourInfoHeader = ({ listing, deadline }: InviteToApplySubmitYourInfoProps) => {
  return (
    <>
      <p>{listing.Name}</p>
      <p>{getListingAddressString(listing)}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.p1")}</p>
      <p>{deadline}</p>
    </>
  )
}

const SubmitYourInfoSidebarBlock = ({ listing }: { listing: RailsSaleListing }) => {
  return (
    <>
      <p>{t("contactAgent.contact")}</p>
      <p>{t("inviteToApplyPage.submitYourInfo.sidebar")}</p>
      <LeasingAgent listing={listing} />
    </>
  )
}

const InviteToApplySubmitYourInfo = ({
  listing,
  deadline,
}: InviteToApplySubmitYourInfoProps) => {
  return (
    <HeaderSidebarLayout
      title={`${t("pageTitle.submitYourInfo.title", { listingName: listing.Name })}`}
      sidebarContent={<SubmitYourInfoSidebarBlock listing={listing} />}
    >
      <SubmitYourInfoHeader listing={listing} deadline={deadline} />
      <DeadlineBanner deadline={deadline} />
      <PreparingYourApplication />
      <WhatToDo />
      <WhatHappensNext />
    </HeaderSidebarLayout>
  )
}

export default InviteToApplySubmitYourInfo
