import { createContext, createElement, FunctionComponent } from "react"

type ConfigContextProps = {
  assetPaths: unknown
  getAssetPath: (key: string) => string
  listingsAlertUrl: string
}

export const ConfigContext = createContext<ConfigContextProps>({
  assetPaths: {},
  getAssetPath: () => undefined,
  listingsAlertUrl: "",
})

export const ConfigProvider: FunctionComponent<{
  assetPaths: unknown
  children: React.ReactNode
}> = ({ assetPaths, children }) => {
  const getAssetPath = (key: string) => {
    return assetPaths[key]
  }

  return createElement(
    ConfigContext.Provider,
    {
      value: {
        assetPaths,
        getAssetPath,
        listingsAlertUrl: "https://confirmsubscription.com/h/y/C3BAFCD742D47910",
      },
    },
    children
  )
}

export default ConfigContext
