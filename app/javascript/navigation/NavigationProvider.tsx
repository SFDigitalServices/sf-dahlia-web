import React, { ReactNode } from "react"

import { NavigationContext } from "@bloom-housing/ui-components"

import Link from "./Link"
import Router from "./Router"

type NavigationProviderProps = {
  children: ReactNode
}

const NavigationProvider = ({ children }: NavigationProviderProps) => (
  <NavigationContext.Provider
    value={{
      LinkComponent: Link,
      router: Router,
    }}
  >
    {children}
  </NavigationContext.Provider>
)

export default NavigationProvider
