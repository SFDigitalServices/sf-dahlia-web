import React from "react"
import withAppSetup from "../../layouts/withAppSetup"

interface ApplicationIntroPageProps {
  assetPaths: unknown
}

const ApplicationIntroPage = (_props: ApplicationIntroPageProps) => {
    console.log("applicatons")

  return (
    <div>
        "hello world"
    </div>
  )
}

export default withAppSetup(ApplicationIntroPage)
