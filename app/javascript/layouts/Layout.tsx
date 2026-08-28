import React, { useContext } from "react"
import { useAuth } from "@clerk/clerk-react"
import { useLocation } from "react-router"

import {
  AlertBox,
  AlertTypes,
  FooterNav,
  FooterSection,
  Icon,
  LangItem,
  SiteFooter,
  t,
} from "@bloom-housing/ui-components"
import { SiteHeader, MenuLink } from "../components/SiteHeader/SiteHeader"
import Markdown from "markdown-to-jsx"
import UserContext from "../authentication/context/UserContext"
import { clearHeaders, isTokenValid } from "../authentication/token"
import { ConfigContext } from "../lib/ConfigContext"
import { Link } from "@bloom-housing/ui-seeds"
import {
  getCurrentLanguage,
  getSfGovUrl,
  LANGUAGE_CONFIGS,
  localizedFormat,
  renderInlineMarkup,
} from "../util/languageUtil"
import {
  getCreateAccountPath,
  getDisclaimerPath,
  getLocalizedPath,
  getPrivacyPolicyPath,
  getSignInPath,
  isSignInOrCreateAccountFlow,
  localizedPath,
} from "../util/routeUtil"
import MetaTags from "./MetaTags"
import ErrorBoundary, { BoundaryScope } from "../components/ErrorBoundary"
import { HelmetProvider } from "react-helmet-async"

import "./Layout.scss"
import { useFeatureFlag } from "../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../modules/constants"

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
        window.location.href = getLocalizedPath(
          window.location.pathname,
          item.prefix,
          window.location.search
        )
      },
    })
  }

  return languageItems
}

const getMenuLinks = (
  signedIn: boolean,
  signOut: () => void | Promise<void>,
  accountLayoutEnabled: boolean,
  getAssetPath: (path: string) => string,
  hideSignInAndAccount: boolean
) => {
  const menuLinks: MenuLink[] = [
    {
      title: t("nav.rent"),
      href: localizedPath("/listings/for-rent"),
    },
    {
      title: t("nav.buy"),
      href: localizedPath("/listings/for-sale"),
    },
    {
      title: t("nav.getAssistance"),
      href: localizedPath("/get-assistance"),
    },
  ]

  if (hideSignInAndAccount) {
    return menuLinks
  }

  if (signedIn) {
    menuLinks.push({
      title: t("accountLayout.nav.account"),
      subMenuLinks: [
        {
          title: accountLayoutEnabled ? t("accountLayout.nav.overview") : t("nav.myDashboard"),
          href: localizedPath("/account"),
          iconElement: <Icon symbol="profile" size="medium" className="pr-2" />,
        },
        ...(accountLayoutEnabled
          ? [
              {
                title: t("accountLayout.nav.contactInfo"),
                href: localizedPath("/account/contact"),
                iconElement: (
                  <img
                    src={getAssetPath("contact-info.svg")}
                    alt=""
                    className="pr-2"
                    style={{ height: "1rem" }}
                  />
                ),
              },
            ]
          : []),
        {
          title: accountLayoutEnabled
            ? t("accountLayout.nav.applications")
            : t("nav.myApplications"),
          href: localizedPath("/account/applications"),
          iconElement: <Icon symbol="application" size="medium" className="pr-2" />,
        },
        {
          title: accountLayoutEnabled
            ? t("accountSettings.title.sentenceCase")
            : t("nav.accountSettings"),
          href: localizedPath("/account/settings"),
          iconElement: <Icon symbol="settings" size="medium" className="pr-2" />,
        },
        {
          title: accountLayoutEnabled ? t("accountLayout.nav.signOut") : t("nav.signOut"),
          iconElement: <div className="w-6" />, // Empty div to keep the icon space
          onClick: () => {
            void Promise.resolve(signOut()).finally(() => {
              window.location.href = getSignInPath()
            })
          },
        },
      ],
    })
  } else {
    menuLinks.push({
      title: t("nav.signIn"),
      href: localizedPath("/sign-in"),
    })
  }
  return menuLinks
}

const LayoutContent = ({
  signedIn,
  signOut,
  children,
  title,
  description,
  image,
}: LayoutProps & { signedIn: boolean; signOut: () => void | Promise<void> }) => {
  const { getAssetPath } = useContext(ConfigContext)
  const { pathname } = useLocation()
  const { unleashFlag: accountLayoutEnabled } = useFeatureFlag(UNLEASH_FLAG.ACCOUNTS_LAYOUT, false)

  if (window.document["documentMode"]) {
    /* eslint-disable-next-line react-hooks/immutability */
    window.location.href = "/ie-deprecated.html"
    return
  }
  const feedbackBanner = (
    <div className="feedback-link">
      {renderInlineMarkup(
        t("nav.getFeedback", {
          feedbackUrl: `https://airtable.com/appUW1tM8te0Lmf6q/pagyZulZJCm1V4G8D/form?prefill_Last%20visited=${encodeURIComponent(window.location.pathname)}&hide_Last%20visited=true`,
        })
      )}
    </div>
  )

  const topAlert = (
    <>
      {process.env.TOP_MESSAGE && (
        <AlertBox
          type={asAlertType(process.env.TOP_MESSAGE_TYPE || "")}
          inverted={process.env.TOP_MESSAGE_INVERTED === "true"}
          boundToLayoutWidth
          className="top-message-alert"
        >
          {renderInlineMarkup(
            t(process.env.TOP_MESSAGE, {
              date: process.env.REQUIRED_LOGINS_DATE
                ? localizedFormat(process.env.REQUIRED_LOGINS_DATE, "LL")
                : "",
              link: getCreateAccountPath(),
            })
          )}
        </AlertBox>
      )}
    </>
  )

  return (
    <HelmetProvider>
      <div className="notranslate site-wrapper">
        <div className="site-content">
          <MetaTags title={title} description={description} image={image} />
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
            menuLinks={getMenuLinks(
              signedIn,
              signOut,
              accountLayoutEnabled,
              getAssetPath,
              isSignInOrCreateAccountFlow(pathname)
            )}
            strings={{
              skipToMainContent: t("t.skipToMainContent"),
              logoAriaLable: t("t.dahliaSanFranciscoHousingPortal"),
            }}
            mainContentId={"main-content"}
          />

          <main data-testid="main-content-test-id" id="main-content">
            <ErrorBoundary boundaryScope={BoundaryScope.content}>{children}</ErrorBoundary>
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
              className="text-gray-500 no-underline"
              href={`https://airtable.com/appUW1tM8te0Lmf6q/pagyZulZJCm1V4G8D/form?prefill_Last+visited=${encodeURIComponent(window.location.pathname)}&hide_Last+visited=true`}
              newWindowTarget
              hideExternalLinkIcon
            >
              {t("footer.giveFeedback")}
            </Link>
            <Link className="text-gray-500 no-underline" href="mailto:sfhousinginfo@sfgov.org">
              {t("footer.contact")}
            </Link>
            <Link className="text-gray-500 no-underline" href={getDisclaimerPath()}>
              {t("footer.disclaimer")}
            </Link>
            <Link className="text-gray-500 no-underline" href={getPrivacyPolicyPath()}>
              {t("footer.privacyPolicy")}
            </Link>
          </FooterNav>
        </SiteFooter>
      </div>
    </HelmetProvider>
  )
}

const DeviseLayout = (props: LayoutProps) => {
  const { signOut } = useContext(UserContext)
  return <LayoutContent {...props} signedIn={isTokenValid()} signOut={() => signOut?.()} />
}

const ClerkLayout = (props: LayoutProps) => {
  const { isSignedIn, signOut } = useAuth()
  return (
    <LayoutContent
      {...props}
      signedIn={Boolean(isSignedIn)}
      signOut={async () => {
        // Log out Devise user
        clearHeaders()
        await signOut()
      }}
    />
  )
}

const Layout = (props: LayoutProps) => {
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  if (!flagsReady) {
    return null
  }

  return clerkEnabled ? <ClerkLayout {...props} /> : <DeviseLayout {...props} />
}

export default Layout
