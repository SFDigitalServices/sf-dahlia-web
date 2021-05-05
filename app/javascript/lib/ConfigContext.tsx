import { createContext, createElement, FunctionComponent } from "react"

type ConfigContextProps = {
  assetPaths: unknown
  getAssetPath: (key: string) => string
}

export const ConfigContext = createContext<ConfigContextProps>({
  assetPaths: {},
  getAssetPath: () => undefined,
})

export const ConfigProvider: FunctionComponent<{
  assetPaths: unknown
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
      },
    },
    children
  )
}

export default ConfigContext
