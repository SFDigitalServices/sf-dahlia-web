import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { Card } from "@bloom-housing/ui-seeds"
import { Icon, t, type UniversalIconType } from "@bloom-housing/ui-components"
import UserContext from "../../authentication/context/UserContext"
import {
  getMyAccountSettingsPath,
  getMyApplicationsPath,
  getSignInPath,
} from "../../util/routeUtil"
import { renderInlineMarkup } from "../../util/languageUtil"

interface MyAccountProps {
  assetPaths: unknown
}

const AccountDashCard = ({
  title,
  description,
  link,
  icon,
  removeBottomBorder = false,
}: {
  title: string
  description: string
  link: string
  icon: UniversalIconType
  removeBottomBorder?: boolean
}) => {
  return (
    <a
      href={link}
      className="text-black block outline-none focus:underline flex-1 w-full md:w-1/2  h-auto max-h-72"
    >
      <Card
        spacing="md"
        className={`cursor-pointer text-gray-850 hover:text-primary flex justify-start items-center text-center h-full h-auto max-h-72 rounded-none md:rounded-lg ${
          removeBottomBorder ? "border-b-0 md:border-b" : ""
        }`}
      >
        <Card.Header className="flex justify-center w-full flex-col items-center">
          <div
            className="pb-4 border-blue-500 w-min px-4 md:px-8 mb-6"
            style={{ borderBottom: "3px solid" }}
          >
            <Icon size="xlarge" className="md:hidden block" symbol={icon} />
            <Icon size="2xl" className="md:block hidden" symbol={icon} />
          </div>
          <h2 className="text-xl md:text-2xl">{title}</h2>
        </Card.Header>

        <Card.Section>
          <p className="text-base">{renderInlineMarkup(description)}</p>
        </Card.Section>
      </Card>
    </a>
  )
}

const MyAccount = (_props: MyAccountProps) => {
  const { profile, loading, initialStateLoaded } = React.useContext(UserContext)

  if (!profile && !loading && initialStateLoaded) {
    // TODO: Redirect to React sign in page and show a message that user needs to sign in
    window.location.href = getSignInPath()
    return null
  }

  return (
    <Layout title={"My Account"}>
      <section className="bg-gray-300 flex justify-center">
        <h1 className="sr-only">{t("nav.myDashboard")}</h1>
        <div className="w-full md:py-16 max-w-5xl">
          <div className="bg-gray-300 h-full flex flex-grow flex-col md:flex-row md:gap-7">
            <AccountDashCard
              title={t("accountDashboard.myApplications.title")}
              description={t("accountDashboard.myApplications.description")}
              link={`${getMyApplicationsPath()}?react=true`} // TODO: Remove react=true when we have the Accounts flag set to true in CircleCI
              icon="application"
              removeBottomBorder
            />

            <AccountDashCard
              title={t("accountSettings.title.sentenceCase")}
              description={t("accountDashboard.accountSettings.description")}
              link={`${getMyAccountSettingsPath()}?react=true`}
              icon="settings"
            />
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default withAppSetup(MyAccount)
