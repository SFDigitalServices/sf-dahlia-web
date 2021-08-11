import React, { useContext } from "react"

import { t, SiteAlert, Hero, ActionBlock, Icon } from "@bloom-housing/ui-components"

import Layout from "../layouts/Layout"
import withAppSetup from "../layouts/withAppSetup"
import { ConfigContext } from "../lib/ConfigContext"
import Link from "../navigation/Link"
import { getRentalDirectoryPath, getSaleDirectoryPath } from "../util/routeUtil"

interface HomePageProps {
  assetPaths: unknown
}

const HomePage = (_props: HomePageProps) => {
  const alertClasses = "flex-grow mt-6 max-w-6xl w-full"
  const { getAssetPath } = useContext(ConfigContext)

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
        title={t("welcome.title")}
        backgroundImage={getAssetPath("bg@1200.jpg")}
        buttonLink={getRentalDirectoryPath()}
        buttonTitle={t("welcome.seeRentalListings")}
        secondaryButtonLink={getSaleDirectoryPath()}
        secondaryButtonTitle={t("welcome.seeSaleListings")}
      />
      <div className="homepage-extra">
        <ActionBlock
          header={t("welcome.newListingEmailAlert")}
          background="primary-lighter"
          icon={<Icon size="3xl" symbol="mail" />}
          actions={[
            <Link
              className="button"
              key="action-1"
              href="https://confirmsubscription.com/h/y/C3BAFCD742D47910"
            >
              {t("welcome.signUpToday")}
            </Link>,
          ]}
        />
      </div>
    </Layout>
  )
}

export default withAppSetup(HomePage)
