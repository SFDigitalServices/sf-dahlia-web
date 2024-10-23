import React, { ReactNode, useEffect, useState, useContext } from "react"
import Layout from "../../layouts/Layout"
import type RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import {
  localizedFormat,
  formatTimeOfDay,
  getSfGovUrl,
  renderInlineMarkup,
  getPathWithoutLanguagePrefix,
} from "../../util/languageUtil"
import { Icon, t, NavigationContext, LoadingOverlay, Button, AppearanceStyleType } from "@bloom-housing/ui-components"
import { Message } from "@bloom-housing/ui-seeds"
import withAppSetup from "../../layouts/withAppSetup"
import { getListing } from "../../api/listingApiService"
import { getFcfsSalesListingState } from "../../util/listingUtil"
import { ListingState } from "../../modules/listings/ListingState"

import "./how-to-apply.scss"

interface HowToApplyProps {
  assetPaths: unknown
}

const applicationsNotYetOpen = (listing: RailsSaleListing) =>
  listing && getFcfsSalesListingState(listing) === ListingState.NotYetOpen

const Header = ({ headerText }: { headerText: string }) => {
  return <h3 className="text-2xl font-alt-serif">{headerText}</h3>
}

const SubHeader = ({ subHeaderText }: { subHeaderText: string }) => {
  return <h4 className="font-semibold font-alt-sans pt-6 pb-4">{subHeaderText}</h4>
}

const InfoBox = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
    <div className="my-6 p-6 bg-gray-200">
      <div className="font-semibold font-alt-sans text-lg pb-2">{title}</div>
      <div>{children}</div>
    </div>
  )
}

const NotYetOpenMessage = ({ listing }: { listing: RailsSaleListing }) => {
  const datetime = listing.Application_Start_Date_Time

  return (
    <Message
      fullwidth
      className="justify-start leading-5"
      variant="primary"
      customIcon={<Icon symbol="clock" size="medium" />}
    >
      <b>{`${t("howToApplyPage.weAreNotAcceptingApplicationsYet")}`}</b>
      <br />
      {t("listingDetails.applicationsOpen.withDateTime", {
        date: localizedFormat(datetime, "LL"),
        time: formatTimeOfDay(datetime),
      })}
    </Message>
  )
}

const HowLongItTakesSection = ({ listing }: { listing: RailsSaleListing }) => {
  return (
    <div className="py-10">
      <Header headerText={t("howToApplyPage.howLongItTakesSection.title")} />
      <SubHeader subHeaderText={t("howToApplyPage.howLongItTakesSection.subtitle1")} />
      {t("howToApplyPage.howLongItTakesSection.p1")}
      <SubHeader subHeaderText={t("howToApplyPage.howLongItTakesSection.subtitle2")} />
      {t("howToApplyPage.howLongItTakesSection.p2")}
      {listingIsOpen(listing) && (
        <>
          <SubHeader subHeaderText={t("howToApplyPage.howLongItTakesSection.subtitle3")} />
          {renderInlineMarkup(t("howToApplyPage.howLongItTakesSection.p3", { url: "#" }))}
        </>
      )}
    </div>
  )
}

const renderInlineSfGovUrl = (key: string, url: string, node: number) => {
  return renderInlineMarkup(
    `${t(key, {
      url: getSfGovUrl(url, node),
    })}`
  )
}

const eligibilityListItems = [
  { index: 1 },
  {
    index: 2,
    link: "https://sf.gov/determine-if-you-can-buy-affordable-housing-program",
    node: 7164,
  },
  {
    index: 3,
    link: "https://sf.gov/sign-complete-homebuyer-education",
    node: 212,
  },
  {
    index: 4,
    link: "https://sf.gov/reports/october-2023/find-lender-below-market-rate-program",
    node: 6953,
  },
  { index: 5 },
]

const BeforeYouStartSection = () => {
  return (
    <div className="pb-10">
      <Header headerText={t("howToApplyPage.beforeYouStartSection.title")} />
      <SubHeader subHeaderText={t("howToApplyPage.beforeYouStartSection.subtitle1")} />
      <div>{t("howToApplyPage.beforeYouStartSection.eligibilityList.title")}</div>
      <ul className="mb-0 pt-2">
        {eligibilityListItems.map((item) => (
          <li key={item.index}>
            {
              // Possible keys:
              // howToApplyPage.beforeYouStartSection.eligibilityList.listItem1
              // howToApplyPage.beforeYouStartSection.eligibilityList.listItem2
              // howToApplyPage.beforeYouStartSection.eligibilityList.listItem3
              // howToApplyPage.beforeYouStartSection.eligibilityList.listItem4
              // howToApplyPage.beforeYouStartSection.eligibilityList.listItem5

              renderInlineSfGovUrl(
                `howToApplyPage.beforeYouStartSection.eligibilityList.listItem${item.index}`,
                item.link,
                item.node
              )
            }
          </li>
        ))}
      </ul>
      <SubHeader subHeaderText={t("howToApplyPage.beforeYouStartSection.subtitle2")} />
      {t("howToApplyPage.beforeYouStartSection.p2")}
    </div>
  )
}

const HowToApplyListItem = ({
  headerText,
  children,
}: {
  headerText: string
  children: ReactNode
}) => {
  return (
    <li>
      <h4 className="font-semibold font-alt-sans pb-4">{headerText}</h4>
      <div className="text-base">{children}</div>
    </li>
  )
}

const FillOutPdfAppStep = () => {
  return (
    <HowToApplyListItem headerText={t("listings.fcfs.bmrSales.howToApply.step1")}>
      <div className="text-base pb-2">{t("howToApplyPage.howToApplySection.step1.p1")}</div>
      <div className="text-base">{t("howToApplyPage.howToApplySection.step1.p2")}</div>
      <InfoBox title={t("howToApplyPage.howToApplySection.step1.infoBox.title")}>
        {t("howToApplyPage.howToApplySection.step1.infoBox.p1")}
      </InfoBox>
    </HowToApplyListItem>
  )
}

const GatherDocumentsStep = () => {
  return (
    <HowToApplyListItem headerText={t("listings.fcfs.bmrSales.howToApply.step2")}>
      <div className="text-base">{t("howToApplyPage.howToApplySection.step2.p1")}</div>
      <InfoBox title={t("howToApplyPage.howToApplySection.step2.infoBox.title")}>
        {t("howToApplyPage.howToApplySection.step2.infoBox.p1")}
      </InfoBox>
    </HowToApplyListItem>
  )
}

const CombineStep = () => {
  return (
    <HowToApplyListItem headerText={t("howToApplyPage.howToApplySection.step3.title")}>
      <div className="text-base">{t("howToApplyPage.howToApplySection.step3.p1")}</div>
      <InfoBox title={t("howToApplyPage.howToApplySection.step3.infoBox.title")}>
        <div>{t("howToApplyPage.howToApplySection.step3.infoBox.p1")}</div>
        <div className="pt-4 italic">
          <div>{t("howToApplyPage.howToApplySection.step3.infoBox.p2")}</div>
          <div>
            <Icon size="medium" symbol="document" />
            {t("howToApplyPage.howToApplySection.step3.infoBox.p3")}
          </div>
        </div>
      </InfoBox>
      <div className="text-base">
        {renderInlineMarkup(t("howToApplyPage.howToApplySection.step3.p2"), "<i>")}
      </div>
    </HowToApplyListItem>
  )
}

const CreateBoxAccountStep = () => {
  return (
    <HowToApplyListItem headerText={t("howToApplyPage.howToApplySection.step4.title")}>
      <div className="text-base pb-2">
        {
          // TODO: DAH-2847 Add url
          renderInlineMarkup(t("howToApplyPage.howToApplySection.step4.p1", { url: "#" }))
        }
      </div>
      <div className="text-base">{t("howToApplyPage.howToApplySection.step4.p2")}</div>
    </HowToApplyListItem>
  )
}

const SubmitApplicationStep = ({ listing }: { listing: RailsSaleListing }) => {
  const datetime = listing.Application_Start_Date_Time

  return (
    <HowToApplyListItem headerText={t("howToApplyPage.howToApplySection.step5.title")}>
      <div className="text-base">{t("howToApplyPage.howToApplySection.step5.p1")}</div>
      <ul className="mb-0 pb-2">
        <li className="text-base">
          {
            // TODO: DAH-2847 Add url
            renderInlineMarkup(t("howToApplyPage.howToApplySection.step5.listItem1", { url: "#" }))
          }
        </li>
        <li className="text-base">{t("howToApplyPage.howToApplySection.step5.listItem2")}</li>
        <li className="text-base">{t("howToApplyPage.howToApplySection.step5.listItem3")}</li>
      </ul>
      <div className="text-base">{t("howToApplyPage.howToApplySection.step5.p2")}</div>
      {applicationsNotYetOpen(listing) && (
        <div className="text-base pt-6">
          <Icon symbol="clock" size="medium" />
          &nbsp;
          {t("howToApplyPage.howToApplySection.step5.applicationsOpenCheckBackHere", {
            date: localizedFormat(datetime, "LL"),
            time: formatTimeOfDay(datetime),
          })}
        </div>
      )}

      {listingIsOpen(listing) && (
        <Button className="mt-6" styleType={AppearanceStyleType.primary}>
          {t("howToApplyPage.howToApplySection.step5.button")}
        </Button>
      )}
      <InfoBox title={t("howToApplyPage.howToApplySection.step5.infoBox.title")}>
        {t("howToApplyPage.howToApplySection.step5.infoBox.p1")}
      </InfoBox>
    </HowToApplyListItem>
  )
}

const HowToApplySection = ({ listing }: { listing: RailsSaleListing }) => {
  return (
    <>
      <Header headerText={t("pageTitle.howToApply")} />
      <div className="pt-4">
        <ol className="process-list">
          <FillOutPdfAppStep />
          <GatherDocumentsStep />
          <CombineStep />
          <CreateBoxAccountStep />
          <SubmitApplicationStep listing={listing} />
        </ol>
      </div>
    </>
  )
}

const WhatHappensNextSection = () => {
  return (
    <>
      <Header headerText={t("howToApplyPage.whatHappensNext.title")} />
      <div className="pt-4">
        {renderInlineMarkup(t("howToApplyPage.whatHappensNext.p1"), "<b>")}
      </div>
      <div className="py-2">
        {renderInlineMarkup(t("howToApplyPage.whatHappensNext.p2"), "<b>")}
      </div>
      <a className="underline" target="_blank" href="//google.com">
        {t("listings.fcfs.bmrSales.noLotteryRequired.footer")}
      </a>
    </>
  )
}

const HowToApply = (_props: HowToApplyProps) => {
  const [listing, setListing] = useState<RailsSaleListing>(null)

  const { router } = useContext(NavigationContext)

  // identical data loading strategy to the Listing Details page
  useEffect(() => {
    const path = getPathWithoutLanguagePrefix(router.pathname)
    void getListing(path.split("/")[2]).then((listing: RailsSaleListing) => {
      if (!listing) {
        router.push("/")
      }
      setListing(listing)
    })
  }, [router, router.pathname])

  return (
    <LoadingOverlay isLoading={!listing}>
      <Layout title={t("pageTitle.howToApply")}>
        <section className="flex md:px-5">
          <article className="markdown max-w-5xl m-auto">
            <div className="pt-4 md:py-0 max-w-3xl">
              <div className="my-6 md:my-12 px-5">
                {listing && (
                  <>
                    {applicationsNotYetOpen(listing) && <NotYetOpenMessage listing={listing} />}
                    <HowLongItTakesSection listing={listing} />
                    <BeforeYouStartSection />
                    <HowToApplySection listing={listing} />
                    <WhatHappensNextSection />
                  </>
                )}
              </div>
            </div>
          </article>
        </section>
      </Layout>
    </LoadingOverlay>
  )
}

export default withAppSetup(HowToApply)
