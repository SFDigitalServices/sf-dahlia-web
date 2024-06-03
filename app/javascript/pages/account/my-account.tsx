import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { Card } from "@bloom-housing/ui-seeds"

import "./my-account.scss"

interface MyAccountProps {
  assetPaths: unknown
}

const AccountCard = ({
  title,
  description,
  link,
}: {
  title: string
  description: string
  link: string
  icon: string
}) => {
  return (
    <a href={link} className="text-black block outline-none rounded_card focus:underline flex-1">
      <Card spacing="md" className="cursor-pointer h-full">
        <Card.Header>
          <h1>{title}</h1>
        </Card.Header>

        <Card.Section>
          <p>{description}</p>
        </Card.Section>
      </Card>
    </a>
  )
}

const MyAccount = (_props: MyAccountProps) => {
  return (
    <Layout title={"My Account"}>
      <section className="bg-gray-300 flex justify-center">
        <div className="max-w-5xl w-full md:w-auto md:mx-auto md:py-16">
          <div className="bg-gray-300 h-full flex flex-grow flex-col md:flex-row md:gap-6">
            <AccountCard
              title="My Applications"
              description="See lottery dates and listings for properties for which you've applied"
              link="/my-applications"
              icon="applications"
            />

            <AccountCard
              title="Account Settings"
              description="Account settings, email and password"
              link="/account-settings"
              icon="applications"
            />
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default withAppSetup(MyAccount)
