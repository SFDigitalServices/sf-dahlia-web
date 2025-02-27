import React, { useContext } from "react"

import {
  AlertBox,
  AlertTypes,
  FooterNav,
  FooterSection,
  Icon,
  LangItem,
  MenuLink,
  SiteFooter,
  SiteHeader,
  t,
} from "@bloom-housing/ui-components"
import Markdown from "markdown-to-jsx"
import UserContext from "../authentication/context/UserContext"
import { ConfigContext } from "../lib/ConfigContext"
import Link from "../navigation/Link"
import { getCurrentLanguage, getSfGovUrl, LANGUAGE_CONFIGS } from "../util/languageUtil"
import {
  getDisclaimerPath,
  getLocalizedPath,
  getPrivacyPolicyPath,
  getSignInPath,
} from "../util/routeUtil"
import MetaTags from "./MetaTags"
import ErrorBoundary, { BoundaryScope } from "../components/ErrorBoundary"
import { HelmetProvider } from "react-helmet-async"

import "./Layout.scss"
import { isTokenValid } from "../authentication/token"

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
          iconElement: <Icon symbol="profile" size="medium" className="pr-2" />,
        },
        {
          title: t("nav.myApplications"),
          href: "/my-applications",
          iconElement: <Icon symbol="application" size="medium" className="pr-2" />,
        },
        {
          title: t("nav.accountSettings"),
          href: "/account-settings",
          iconElement: <Icon symbol="settings" size="medium" className="pr-2" />,
        },
        {
          title: t("nav.signOut"),
          iconElement: <div className="w-6" />, // Empty div to keep the icon space
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
  const { signOut } = useContext(UserContext)

  // eslint-disable-next-line dot-notation
  if (window.document["documentMode"]) {
    window.location.href = "/ie-deprecated.html"
    return
  }
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
    <HelmetProvider>
      <div className="notranslate site-wrapper">
        <div className="site-content">
          <MetaTags title={props.title} description={props.description} image={props.image} />
          {topAlert}
          <SiteHeader
            homeURL={"/"}
            dropdownItemClassName={"text-2xs"}
            languageNavLabel={t("languages.choose")}
            languages={getLanguageItems()}
            logoSrc={getAssetPath("DAHLIA-logo.svg")}
            notice={feedbackBanner}
            noticeMobile={true}
            mobileDrawer={true}
            flattenSubMenus={true}
            imageOnly={true}
            mobileText={true}
            logoWidth={"medium"}
            logoClass="translate"
            menuLinks={getMenuLinks(isTokenValid(), signOut)}
            strings={{
              skipToMainContent: t("t.skipToMainContent"),
              logoAriaLable: t("t.dahliaSanFranciscoHousingPortal"),
            }}
            mainContentId={"main-content"}
          />

          <main data-testid="main-content-test-id" id="main-content">
            <ErrorBoundary boundaryScope={BoundaryScope.content}>{props.children}</ErrorBoundary>
          </main>
        </div>

        <SiteFooter>
          <FooterSection>
            <img src={getAssetPath("logo-city.png")} alt="" data-testid="footer-logo-test-id" />
          </FooterSection>
          <FooterSection small>
            <p className="text-gray-500">
              <Markdown>
                {t("footer.dahliaDescription", {
                  mohcdUrl: getSfGovUrl(
                    "https://sf.gov/departments/mayors-office-housing-and-community-development"
                  ),
                })}
              </Markdown>
            </p>
            <p className="text-xs mt-4 text-gray-500">
              <Markdown>
                {t("footer.inPartnershipWith", {
                  sfdsUrl: getSfGovUrl(
                    "https://sf.gov/departments/city-administrator/digital-services"
                  ),
                  mayorUrl: getSfGovUrl("https://sf.gov/departments/mayors-office-innovation"),
                })}
              </Markdown>
            </p>
          </FooterSection>

          <FooterSection>
            <p className="text-sm">
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
    </HelmetProvider>
  )
}

export default Layout
