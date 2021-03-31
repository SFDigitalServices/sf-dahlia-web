import React from 'react'
import Layout from "../layouts/Layout"
import { MarkdownSection, t, MetaTags, SiteAlert } from '@bloom-housing/ui-components'
import { Listing } from "@bloom-housing/backend-core/types"
import { LinkButton } from '@bloom-housing/ui-components'
import { Hero } from '@bloom-housing/ui-components'
import Head from 'next/head'

export interface HomePageProps {
  listings?: Listing[]
}

const HomePage = (props: HomePageProps) => {
  const metaImage = "" // TODO: replace with hero image
  const alertClasses = "flex-grow mt-6 max-w-6xl w-full"

  return (
    <Layout>
      <Head>
        <title>{t("nav.siteTitle")}</title>
      </Head>
      <MetaTags
        title={t("nav.siteTitle")}
        image={metaImage}
        description={t("pageDescription.welcome", { regionName: t("region.name") })}
      />
      <div className="flex absolute w-full flex-col items-center">
        <SiteAlert type="alert" className={alertClasses} />
        <SiteAlert type="success" className={alertClasses} timeout={30000} />
      </div>
      <Hero
        title={
          <>
            {t("welcome.title")} <em>{t("region.name")}</em>
          </>
        }
        buttonTitle={t("welcome.seeRentalListings")}
        buttonLink="/listings"
        listings={props.listings}
      />
      <div className="homepage-extra">
        <MarkdownSection fullwidth>
          <>
            <p>{t("welcome.seeMoreOpportunities")}</p>
            <LinkButton href="/additional-resources">
              {t("welcome.viewAdditionalHousing")}
            </LinkButton>
          </>
        </MarkdownSection>
      </div>
    </Layout>
  )
}

export default HomePage