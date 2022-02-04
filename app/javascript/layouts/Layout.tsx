import React, { useContext } from "react"

import {
  AlertBox,
  FooterNav,
  FooterSection,
  LangItem,
  SiteFooter,
  SiteHeader,
  t,
  AlertTypes,
  MenuLink,
} from "@bloom-housing/ui-components"
import Markdown from "markdown-to-jsx"
import UserContext from "../authentication/context/UserContext"
import { ConfigContext } from "../lib/ConfigContext"
import Link from "../navigation/Link"
import { getCurrentLanguage, LANGUAGE_CONFIGS } from "../util/languageUtil"
import {
  getDisclaimerPath,
  getPrivacyPolicyPath,
  getSignInPath,
  getLocalizedPath,
} from "../util/routeUtil"
import MetaTags from "./MetaTags"

export interface LayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  image?: string
}

const asAlertType = (alertType: string): AlertTypes => {
  switch (alertType) {
    case "notice":
      return "notice"
    case "success":
      return "success"
    case "alert":
    default:
      return "alert"
  }
}

const getLanguageItems = () => {
  const languageItems: LangItem[] = []
  for (const item of Object.values(LANGUAGE_CONFIGS)) {
    languageItems.push({
      active: getCurrentLanguage(window.location.pathname) === item.prefix,
      label: item.getLabel(),
      onClick: () => {
        window.location.href = getLocalizedPath(window.location.pathname, item.prefix)
      },
    })
  }

  return languageItems
}

const getMenuLinks = (signedIn: boolean, signOut: () => void) => {
  const menuLinks: MenuLink[] = [
    {
      title: t("nav.rent"),
      href: "/listings/for-rent",
    },
    {
      title: t("nav.buy"),
      href: "/listings/for-sale",
    },
    {
      title: t("nav.myFavorites"),
      href: "/favorites",
    },
    {
      title: t("nav.getAssistance"),
      href: "/get-assistance",
    },
  ]

  if (signedIn) {
    menuLinks.push({
      title: t("nav.myAccount"),
      subMenuLinks: [
        {
          title: t("nav.myDashboard"),
          href: "/my-account",
        },
        {
          title: t("nav.myApplications"),
          href: "/my-applications",
        },
        {
          title: t("nav.accountSettings"),
          href: "/account-settings",
        },
        {
          title: t("nav.signOut"),
          onClick: () => {
            // FIXME: Setup Site alert message for logging out DAH-974
            // setSiteAlertMessage(t("signIn.signedOutSuccessfully"), "notice")
            signOut()
            // TODO: convert this to use react router when SPA routing is added
            window.location.href = getSignInPath()
          },
        },
      ],
    })
  } else {
    menuLinks.push({
      title: t("nav.signIn"),
      href: "/sign-in",
    })
  }
  return menuLinks
}

const Layout = (props: LayoutProps) => {
  const { getAssetPath } = useContext(ConfigContext)
  const { profile, signOut } = useContext(UserContext)

  // eslint-disable-next-line dot-notation
  console.log(
    "IE11 document mode",
    window.document["documentMode"],
    "DIRECTORY_PAGE_REACT",
    process.env.DIRECTORY_PAGE_REACT
  )
  if (window.document["documentMode"] && process.env.DIRECTORY_PAGE_REACT === "true") {
    window.location.href = "/ie-deprecated.html"
    return
  }

  const researchBanner = (
    <Markdown>{t("nav.researchFeedback", { researchUrl: process.env.RESEARCH_FORM_URL })}</Markdown>
  )

  const feedbackBanner = (
    <Markdown>
      {t("nav.getFeedback", { feedbackUrl: "https://airtable.com/shrw64DubWTQfRkdo" })}
    </Markdown>
  )

  const topAlert = (
    <>
      {process.env.TOP_MESSAGE && (
        <AlertBox
          type={asAlertType(process.env.TOP_MESSAGE_TYPE)}
          inverted={process.env.TOP_MESSAGE_INVERTED === "true"}
          narrow
          boundToLayoutWidth
        >
          <Markdown>{process.env.TOP_MESSAGE}</Markdown>
        </AlertBox>
      )}
    </>
  )

  return (
    <div className="site-wrapper">
      <div className="site-content">
        <MetaTags title={props.title} description={props.description} image={props.image} />
        {topAlert}
        <SiteHeader
          homeURL={"/"}
          dropdownItemClassName={"text-xs"}
          menuItemClassName={"pb-4 pt-1 flex items-end"}
          languages={getLanguageItems()}
          logoSrc={getAssetPath("DAHLIA-logo.svg")}
          notice={process.env.SHOW_RESEARCH_BANNER ? researchBanner : feedbackBanner}
          noticeMobile={true}
          mobileDrawer={true}
          flattenSubMenus={true}
          imageOnly={true}
          mobileText={true}
          logoWidth={"medium"}
          menuLinks={getMenuLinks(!!profile, signOut)}
        />

        <main data-testid="main-content-test-id" id="main-content">
          {props.children}
        </main>
      </div>

      <SiteFooter>
        <FooterSection>
          <img src={getAssetPath("logo-city.png")} alt="City &#38; County of San Francisco Logo" />
        </FooterSection>
        <FooterSection small>
          <p className="text-gray-500">
            <Markdown>
              {t("footer.dahliaDescription", {
                mohcdUrl: "https://sf.gov/mohcd",
              })}
            </Markdown>
          </p>
          <p className="text-sm mt-4 text-gray-500">
            <Markdown>
              {t("footer.inPartnershipWith", {
                sfdsUrl: "https://digitalservices.sfgov.org/",
                mayorUrl: "https://www.innovation.sfgov.org/",
              })}
            </Markdown>
          </p>
        </FooterSection>

        <FooterSection>
          <p className="text-tiny">
            {t("footer.forListingQuestions")} <br />
            {t("footer.forGeneralQuestions")}
          </p>
        </FooterSection>
        <FooterNav copyright={`© ${t("footer.cityCountyOfSf")}`}>
          <Link
            className="text-gray-500"
            href="https://airtable.com/shrw64DubWTQfRkdo"
            target="_blank"
            external={true}
          >
            {t("footer.giveFeedback")}
          </Link>
          <Link className="text-gray-500" external={true} href="mailto:sfhousinginfo@sfgov.org">
            {t("footer.contact")}
          </Link>
          <Link className="text-gray-500" href={getDisclaimerPath()}>
            {t("footer.disclaimer")}
          </Link>
          <Link className="text-gray-500" href={getPrivacyPolicyPath()}>
            {t("footer.privacyPolicy")}
          </Link>
        </FooterNav>
      </SiteFooter>
    </div>
  )
}

export default Layout
