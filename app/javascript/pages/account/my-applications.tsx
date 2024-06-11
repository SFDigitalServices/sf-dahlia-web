import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { getApplications } from "../../api/authApiService"
import UserContext from "../../authentication/context/UserContext"
import { getSignInPath } from "../../util/routeUtil"
import { Application } from "../../api/types/rails/application/RailsApplication"

const MyApplications = () => {
  const { profile, loading: authLoading, initialStateLoaded } = React.useContext(UserContext)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  // Temporary until we merge in way to display applications
  // eslint-disable-next-line unused-imports/no-unused-vars
  const [applications, setApplications] = React.useState<Application[]>([])

  React.useEffect(() => {
    setLoading(true)
    if (profile) {
      getApplications()
        .then((applications) => {
          setApplications(applications)
          setLoading(false)
        })
        .catch((error: string) => {
          setError(error)
          setLoading(false)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [authLoading, initialStateLoaded, profile])

  if (!profile && !authLoading && initialStateLoaded) {
    // TODO: Redirect to React sign in page and show a message that user needs to sign in
    window.location.href = getSignInPath()
    return null
  }

  return (
    <Layout title={"My Applications"}>
      <h1>My Applications</h1>
      {error && <p className="text-red-500">{error}</p>}
      {(loading || authLoading) && <p>Loading...</p>}
    </Layout>
  )
}

export default withAppSetup(MyApplications)
