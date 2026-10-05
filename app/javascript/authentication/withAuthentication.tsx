import React from "react"
import { Outlet, useNavigate } from "react-router"
import { isTokenValid, parseUrlParams } from "./token"
import UserContext from "./context/UserContext"
import { useAuthSession } from "./session/AuthSessionProvider"
import { getAddProfilePath, getLocalizedPath, RedirectType } from "../util/routeUtil"
import { getCurrentLanguage } from "../util/languageUtil"
import { useGTMDataLayer } from "../hooks/analytics/useGTMDataLayer"
import { useFeatureFlag } from "../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../modules/constants"

interface WithAuthenticationProps {
  redirectType?: RedirectType
}

export interface ProtectedRouteWrapperProps {
  children?: React.ReactNode
  redirectType?: RedirectType
}

interface AuthenticationWrapperProps {
  children: React.ReactNode
  redirectType?: RedirectType
  redirectToSignIn: (path: string) => void
  redirectToAddProfile: (path: string) => void
}

const getSignInPath = (redirectType?: RedirectType) => {
  const redirectParam = redirectType ? `?redirect=${redirectType}` : ""
  return getLocalizedPath("/sign-in", getCurrentLanguage(), redirectParam)
}

const AuthenticationWrapper = ({
  children,
  redirectType,
  redirectToSignIn,
  redirectToAddProfile,
}: AuthenticationWrapperProps) => {
  const { profile, loading, initialStateLoaded } = React.useContext(UserContext)
  const { status } = useAuthSession()
  const { pushToDataLayer } = useGTMDataLayer()
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  const isSignedIn = status.kind === "signedIn"
  const clerkLoading =
    status.kind === "initializing" || (isSignedIn && !profile && !initialStateLoaded)

  React.useEffect(() => {
    if (!flagsReady || clerkEnabled) return

    const params = parseUrlParams(window.location.href)
    if (!isTokenValid() && !loading && initialStateLoaded) {
      redirectToSignIn(getSignInPath(redirectType))
      return
    }

    if (
      profile &&
      params.get("access-token") &&
      params.get("accountConfirmed") === "true" &&
      params.get("account_confirmation_success") === "true"
    ) {
      pushToDataLayer("account_create_completed", { user_id: profile.id })
      // We want to remove the query params from the URL so that the user can refresh the page without retriggering the analytics event
      const url = window.location.origin + window.location.pathname
      window.history.replaceState({}, document.title, url)
    }
  }, [
    clerkEnabled,
    flagsReady,
    initialStateLoaded,
    loading,
    profile,
    pushToDataLayer,
    redirectToSignIn,
    redirectType,
  ])

  React.useEffect(() => {
    if (!flagsReady || !clerkEnabled || clerkLoading) return

    if (!isSignedIn) {
      redirectToSignIn(getSignInPath(redirectType))
      return
    }
    if (!profile) {
      redirectToAddProfile(getAddProfilePath())
    }
  }, [
    clerkEnabled,
    clerkLoading,
    flagsReady,
    isSignedIn,
    profile,
    redirectToAddProfile,
    redirectToSignIn,
    redirectType,
  ])

  if (!flagsReady) {
    return null
  }

  if (clerkEnabled) {
    if (clerkLoading || !isSignedIn || !profile) {
      return null
    }
  } else if (loading || !profile) {
    return null
  }

  return <>{children}</>
}

export const ProtectedRouteWrapper = ({ children, redirectType }: ProtectedRouteWrapperProps) => {
  const navigate = useNavigate()

  const redirectWithReplace = React.useCallback(
    (path: string) => {
      void navigate(path, { replace: true })
    },
    [navigate]
  )

  return (
    <AuthenticationWrapper
      redirectType={redirectType}
      redirectToSignIn={redirectWithReplace}
      redirectToAddProfile={redirectWithReplace}
    >
      {children ?? <Outlet />}
    </AuthenticationWrapper>
  )
}

/**
 * Higher-order component that handles authentication for protected routes.
 * When the Clerk flag is on, it checks the Clerk session; otherwise it uses
 * the Devise token / UserContext profile.
 */
export const withAuthentication = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { redirectType }: WithAuthenticationProps = {}
) => {
  const WithAuthenticationComponent = (props: P) => {
    const redirectWithWindowAssign = React.useCallback((path: string) => {
      window.location.assign(path)
    }, [])

    return (
      <AuthenticationWrapper
        redirectType={redirectType}
        redirectToSignIn={redirectWithWindowAssign}
        redirectToAddProfile={redirectWithWindowAssign}
      >
        <WrappedComponent {...props} />
      </AuthenticationWrapper>
    )
  }

  // Set display name for easier debugging
  WithAuthenticationComponent.displayName = `WithAuthentication(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`

  return WithAuthenticationComponent
}
