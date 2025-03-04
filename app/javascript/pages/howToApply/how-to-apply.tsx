import React, { ReactNode, useEffect, useState, useContext } from "react"
import type RailsSaleListing from "../../api/types/rails/listings/RailsSaleListing"
import {
  localizedFormat,
  formatTimeOfDay,
  getSfGovUrl,
  renderInlineMarkup,
  getPathWithoutLanguagePrefix,
  getTranslatedString,
} from "../../util/languageUtil"
import { isValidUrl } from "../../util/urlUtil"
import {
  Icon,
  t,
  NavigationContext,
  LoadingOverlay,
  ExpandableContent,
  Order,
  IconFillColors,
  Button,
  AppearanceStyleType,
  AppearanceSizeType,
  LinkButton,
} from "@bloom-housing/ui-components"
import { Heading, Message } from "@bloom-housing/ui-seeds"
import withAppSetup from "../../layouts/withAppSetup"
import { getListing } from "../../api/listingApiService"
import { getFcfsSalesListingState } from "../../util/listingUtil"
import { ListingState } from "../../modules/listings/ListingState"
import { faEnvelope } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "./how-to-apply.scss"
import HeaderSidebarLayout from "../../layouts/HeaderSidebarLayout"
import GetHelpSidebarBlock from "../../layouts/Sidebar/GetHelpSidebarBlock"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { AppPages } from "../../util/routeUtil"

interface HowToApplyProps {
  assetPaths: unknown
}

const generateSubmissionUrl = (listingId: string) => {
  const formAssemblyUrl = process.env.FCFS_FORMASSEMBLY_URL
  if (!isValidUrl(formAssemblyUrl)) return null

  return `${formAssemblyUrl}?ListingID=${listingId}`
}

const applicationsNotYetOpen = (listing: RailsSaleListing) =>
  listing && getFcfsSalesListingState(listing) === ListingState.NotYetOpen

const applicationsOpen = (listing: RailsSaleListing) =>
  listing && getFcfsSalesListingState(listing) === ListingState.Open

const Header = ({ headerText }: { headerText: string }) => {
  return <h2 className="text-2xl mb-0 font-alt-serif">{headerText}</h2>
}

const SubHeader = ({ subHeaderText }: { subHeaderText: string }) => {
  return (
    <Heading size="xl" className="font-semibold font-alt-sans pt-6 pb-4" priority={3}>
      {subHeaderText}
    </Heading>
  )
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
    <div>
      <Header headerText={t("howToApplyPage.howLongItTakesSection.title")} />
      <SubHeader subHeaderText={t("howToApplyPage.howLongItTakesSection.subtitle1")} />
      {t("howToApplyPage.howLongItTakesSection.p1")}
      <SubHeader subHeaderText={t("howToApplyPage.howLongItTakesSection.subtitle2")} />
      {t("howToApplyPage.howLongItTakesSection.p2")}
      {applicationsOpen(listing) && (
        <>
          <SubHeader subHeaderText={t("howToApplyPage.howLongItTakesSection.subtitle3")} />
          {renderInlineMarkup(
            t("howToApplyPage.howLongItTakesSection.p3", {
              url: "#SubmitApplicationStep",
            })
          )}
        </>
      )}
    </div>
  )
}

const renderInlineSfGovUrl = (key: string, url: string) => {
  return renderInlineMarkup(
    `${t(key, {
      url: getSfGovUrl(url),
    })}`
  )
}

const eligibilityListItems = [
  { index: 1 },
  {
    index: 2,
    link: "https://sf.gov/determine-if-you-can-buy-affordable-housing-program",
  },
  {
    index: 3,
    link: "https://sf.gov/sign-complete-homebuyer-education",
  },
  {
    index: 4,
    link: "https://sf.gov/reports/october-2023/find-lender-below-market-rate-program",
  },
  { index: 5 },
]

export const LeasingAgentBox = ({ listing }: { listing: RailsSaleListing }) => {
  return (
    <div className="leasing-agent">
      <p className="m-0">{listing.Leasing_Agent_Name}</p>
      <p className="text-gray-750 text-sm">
        {getTranslatedString(
          listing.Leasing_Agent_Title,
          "Leasing_Agent_Title__c",
          listing.translations
        )}
      </p>
      <a
        href={
          listing.Leasing_Agent_Phone
            ? `tel:${listing.Leasing_Agent_Phone.replace(/[-()]/g, "")}`
            : undefined
        }
      >
        <Icon symbol="phone" size="medium" fill={IconFillColors.primary} className={"pr-2"} />
        {listing.Leasing_Agent_Phone
          ? t("listings.call", { phoneNumber: listing.Leasing_Agent_Phone })
          : undefined}
      </a>
      <div className="pb-3 pt-1">
        <a href={`mailto:${listing.Leasing_Agent_Email}`}>
          <span className="pr-2">
            <FontAwesomeIcon icon={faEnvelope} />
          </span>
          {t("label.emailAddress")}
        </a>
      </div>
      <Heading size="sm" priority={3}>
        {t("contactAgent.officeHours.seeTheUnit")}
      </Heading>
      <p className="text-sm">
        {getTranslatedString(listing.Office_Hours, "Office_Hours__c", listing.translations)}
      </p>
    </div>
  )
}

const BeforeYouStartSection = ({ listing }: { listing: RailsSaleListing }) => {
  return (
    <div className="pt-10">
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
                item.link
              )
            }
          </li>
        ))}
      </ul>
      <SubHeader subHeaderText={t("howToApplyPage.beforeYouStartSection.subtitle2")} />
      {t("howToApplyPage.beforeYouStartSection.p2")}
      <ExpandableContent
        strings={{
          readMore: t("seeTheUnit.makeAnAppointment"),
          readLess: t("seeTheUnit.makeAnAppointment"),
        }}
        order={Order.below}
        className="how-to-apply-dropdown pt-2"
      >
        <LeasingAgentBox listing={listing} />
      </ExpandableContent>
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
      <Heading priority={3} size="xl" className="font-semibold font-alt-sans pb-4">
        {headerText}
      </Heading>
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
      <LinkButton
        styleType={AppearanceStyleType.info}
        size={AppearanceSizeType.small}
        newTab
        href="https://www.sf.gov/sites/default/files/2024-04/BMR Homeownership FCFS Full Application 04.2024.pdf"
      >
        {t("howToApplyPage.howToApplySection.step1.infoBox.button")}
      </LinkButton>
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
        {renderInlineMarkup(
          t("howToApplyPage.howToApplySection.step4.p1", {
            url: "https://account.box.com/signup/personal?tc=annual",
          })
        )}
      </div>
      <div className="text-base">{t("howToApplyPage.howToApplySection.step4.p2")}</div>
      <ExpandableContent
        strings={{
          readMore: t("howToApplyPage.howToApplySection.step4.p3"),
          readLess: t("howToApplyPage.howToApplySection.step4.p3"),
        }}
        order={Order.below}
        className="how-to-apply-dropdown pt-2"
      >
        <span className="dropdown-content">{t("howToApplyPage.howToApplySection.step4.p4")}</span>
      </ExpandableContent>
    </HowToApplyListItem>
  )
}

const SubmitApplicationStep = ({ listing }: { listing: RailsSaleListing }) => {
  const datetime = listing.Application_Start_Date_Time
  const submissionUrl = generateSubmissionUrl(listing.listingID)

  const { unleashFlag: humanTranslationsReady } = useFeatureFlag(
    "temp.webapp.howToApplyPage.step5.updateContent",
    false
  )

  return (
    <HowToApplyListItem headerText={t("howToApplyPage.howToApplySection.step5.title")}>
      <div id="SubmitApplicationStep" className="text-base">
        {humanTranslationsReady
          ? t("howToApplyPage.howToApplySection.step5.p1.v2")
          : t("howToApplyPage.howToApplySection.step5.p1")}
      </div>
      <ul className="mb-0 pb-2">
        <li className="text-base">
          {renderInlineMarkup(
            t("howToApplyPage.howToApplySection.step5.listItem1", { url: "#HowToApplySection" })
          )}
        </li>
        {humanTranslationsReady ? (
          <li className="text-base">{t("howToApplyPage.howToApplySection.step5.listItem2.v2")}</li>
        ) : (
          <>
            <li className="text-base">{t("howToApplyPage.howToApplySection.step5.listItem2")}</li>
            <li className="text-base">{t("howToApplyPage.howToApplySection.step5.listItem3")}</li>
          </>
        )}
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
      {applicationsOpen(listing) && submissionUrl && (
        <Button
          className="mt-6"
          styleType={AppearanceStyleType.primary}
          onClick={() => {
            window.open(submissionUrl, "_blank")
          }}
        >
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
      <Header headerText={t("pageTitle.howToApply.lowercase")} />
      <div className="pt-4" id="HowToApplySection">
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
      <a
        className="underline"
        target="_blank"
        href={getSfGovUrl("https://www.sf.gov/step-by-step/buy-home-without-entering-lottery")}
        aria-label={t("listings.fcfs.bmrSales.noLotteryRequired.footer.aria")}
      >
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
      <HeaderSidebarLayout
        title={listing && `${t("pageTitle.howToApply")} ${listing?.Name}`}
        subtitle={listing && t("howToApplyPage.subTitle")}
        sidebarContent={<GetHelpSidebarBlock />}
      >
        <section className="flex pl-12 lg:pl-0">
          <article className="markdown max-w-5xl m-auto">
            <div className="pt-4 md:py-0 max-w-3xl">
              <div className="my-6 pr-6 md:my-12 md:mr-24">
                {listing && (
                  <>
                    {applicationsNotYetOpen(listing) && <NotYetOpenMessage listing={listing} />}
                    <HowLongItTakesSection listing={listing} />
                    <BeforeYouStartSection listing={listing} />
                    <HowToApplySection listing={listing} />
                    <WhatHappensNextSection />
                  </>
                )}
              </div>
            </div>
          </article>
        </section>
      </HeaderSidebarLayout>
    </LoadingOverlay>
  )
}

export default withAppSetup(HowToApply, { pageName: AppPages.HowToApply })
