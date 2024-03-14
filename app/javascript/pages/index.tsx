import React, { useContext } from "react"

import { t, SiteAlert, Hero, ActionBlock, Heading } from "@bloom-housing/ui-components"

import Layout from "../layouts/Layout"
import withAppSetup from "../layouts/withAppSetup"
import { ConfigContext } from "../lib/ConfigContext"
import Link from "../navigation/Link"
import { getRentalDirectoryPath, getSaleDirectoryPath } from "../util/routeUtil"
import { useFeatureFlag } from "../hooks/useFeatureFlag"

interface HomePageProps {
  assetPaths: unknown
}

const HomePage = (_props: HomePageProps) => {
  const alertClasses = "flex-grow mt-6 max-w-6xl w-full"
  const { getAssetPath, listingsAlertUrl } = useContext(ConfigContext)
  const titleFlag = useFeatureFlag("title")

  return (
    <Layout
      title={t("t.dahliaSanFranciscoHousingPortal")}
      image={getAssetPath("bg@1200.jpg")}
      description={t("welcome.title")}
    >
      <div className="flex absolute w-full flex-col items-center">
        <SiteAlert type="alert" className={alertClasses} />
        <SiteAlert type="success" className={alertClasses} timeout={30_000} />
      </div>
      <Hero
        title={titleFlag ? "Feature Flag enabled" : "Feature Flag disabled"}
        backgroundImage={getAssetPath("bg@1200.jpg")}
        buttonLink={getRentalDirectoryPath()}
        buttonTitle={t("welcome.seeRentalListings")}
        secondaryButtonLink={getSaleDirectoryPath()}
        secondaryButtonTitle={t("welcome.seeSaleListings")}
      />
      <div className="homepage-extra mt-2">
        <ActionBlock
          header={<Heading priority={2}>{t("welcome.newListingEmailAlert")}</Heading>}
          actions={[
            <Link className="button" key="action-1" external={true} href={listingsAlertUrl}>
              {t("welcome.signUpToday")}
            </Link>,
          ]}
        />
      </div>
    </Layout>
  )
}

export default withAppSetup(HomePage)
