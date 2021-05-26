import React from "react"

import { Listing } from "@bloom-housing/backend-core/types"
import { MarkdownSection, t, SiteAlert, LinkButton, Hero } from "@bloom-housing/ui-components"
import Head from "next/head"

import MetaTags from "../components/MetaTags"
import Layout from "../layouts/Layout"
import withAppSetup from "../layouts/withAppSetup"
import { getRentalDirectoryPath } from "../util/routeUtil"

interface HomePageProps {
  listings?: Listing[]
  assetPaths: unknown
}

const HomePage = (props: HomePageProps) => {
  const metaImage = "" // TODO: replace with hero image
  const alertClasses = "flex-grow mt-6 max-w-6xl w-full"
  return (
    <Layout>
      <Head>
        <title>{t("t.dahliaSanFranciscoHousingPortal")}</title>
      </Head>
      <MetaTags
        title={t("t.dahliaSanFranciscoHousingPortal")}
        image={metaImage}
        description={t("welcome.title")}
      />
      <div className="flex absolute w-full flex-col items-center">
        <SiteAlert type="alert" className={alertClasses} />
        <SiteAlert type="success" className={alertClasses} timeout={30_000} />
      </div>
      <Hero
        title={t("welcome.title")}
        buttonTitle={t("welcome.seeRentalListings")}
        buttonLink={getRentalDirectoryPath()}
        listings={props.listings}
      />
      <div className="homepage-extra">
        <MarkdownSection fullwidth>
          <p>{t("welcome.newListingEmailAlert")}</p>
          <LinkButton href="http://eepurl.com/dkBd2n">{t("welcome.signUpToday")}</LinkButton>
        </MarkdownSection>
      </div>
    </Layout>
  )
}

export default withAppSetup(HomePage)
