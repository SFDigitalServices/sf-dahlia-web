import React, { ReactNode } from "react"

import { RouteObject, useNavigate } from "react-router-dom"

import Link from "./Link"
import Router from "./Router"
import { NavigationContext } from "@bloom-housing/ui-components"

type NavigationProviderProps = {
  children: ReactNode
  routes: RouteObject[]
}

const NavigationProvider = ({ children, routes }: NavigationProviderProps) => {
  const navigate = useNavigate()

  return (
    <NavigationContext.Provider
      value={{
        LinkComponent: Link(routes, navigate),
        router: Router,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export default NavigationProvider
