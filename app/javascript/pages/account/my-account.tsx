import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { Card } from "@bloom-housing/ui-seeds"
import { Icon, t, type UniversalIconType } from "@bloom-housing/ui-components"

import "./my-account.scss"

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
    <a href={link} className="text-black block outline-none focus:underline flex-1 w-full md:w-1/2">
      <Card
        spacing="md"
        className={`cursor-pointer flex justify-center items-center text-center h-60 rounded-none md:rounded-lg ${
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
          <h1 className="text-xl md:text-2xl">{title}</h1>
        </Card.Header>

        <Card.Section>
          <p className="text-sm">{description}</p>
        </Card.Section>
      </Card>
    </a>
  )
}

const MyAccount = (_props: MyAccountProps) => {
  return (
    <Layout title={"My Account"}>
      <section className="bg-gray-300 flex justify-center">
        <div className="w-full md:py-16 max-w-5xl">
          <div className="bg-gray-300 h-full flex flex-grow flex-col md:flex-row md:gap-7">
            <AccountDashCard
              title={t("myApplications.title")}
              description={t("accountDashboard.myApplications.description")}
              link="/my-applications"
              icon="application"
              removeBottomBorder
            />

            <AccountDashCard
              title={t("accountSettings.title")}
              description={t("accountDashboard.accountSettings.description")}
              link="/account-settings"
              icon="settings"
            />
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default withAppSetup(MyAccount)
