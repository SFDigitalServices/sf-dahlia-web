import React from "react"

import { Listing } from "@bloom-housing/backend-core/types"
import {
  MarkdownSection,
  t,
  MetaTags,
  SiteAlert,
  LinkButton,
  Hero,
} from "@sf-digital-services/ui-components"
import Head from "next/head"

import Layout from "../layouts/Layout"
import withAppSetup from "../layouts/withAppSetup"
import { getRentalDirectoryPath } from "../util/routeUtil"

interface HomePageProps {
  listings?: Listing[]
}

const HomePage = (props: HomePageProps) => {
  const metaImage = "" // TODO: replace with hero image
  const alertClasses = "flex-grow mt-6 max-w-6xl w-full"
  return (
    <Layout>
      <Head>
        <title>{t("t.dahlia_san_francisco_housing_portal")}</title>
      </Head>
      <MetaTags
        title={t("t.dahlia_san_francisco_housing_portal")}
        image={metaImage}
        description={t("welcome.title")}
      />
      <div className="flex absolute w-full flex-col items-center">
        <SiteAlert type="alert" className={alertClasses} />
        <SiteAlert type="success" className={alertClasses} timeout={30_000} />
      </div>
      <Hero
        title={t("welcome.title")}
        buttonTitle={t("welcome.see_rental_listings")}
        buttonLink={getRentalDirectoryPath(window.location.pathname)}
        listings={props.listings}
      />
      <div className="homepage-extra">
        <MarkdownSection fullwidth>
          <p>{t("welcome.new_listing_email_alert")}</p>
          <LinkButton href="http://eepurl.com/dkBd2n">{t("welcome.sign_up_today")}</LinkButton>
        </MarkdownSection>
      </div>
    </Layout>
  )
}

export default withAppSetup(HomePage)
