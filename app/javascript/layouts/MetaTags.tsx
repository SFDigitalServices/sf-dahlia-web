import React, { useContext } from "react"

import { t } from "@bloom-housing/ui-components"
import { HelmetProvider } from "react-helmet-async"

import { ConfigContext } from "../lib/ConfigContext"

export interface MetaTagsProps {
  title?: string
  description?: string
  image?: string
}

const MetaTags = (props: MetaTagsProps) => {
  const { getAssetPath } = useContext(ConfigContext)
  // Description is separated into two check as Helmet can't handle nested elements
  return (
    <>
      <HelmetProvider>
        <title>{props.title || t("t.dahliaSanFranciscoHousingPortal")}</title>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          content="M1zcm6GGM6sHSF_jvkq254DbYAj94JYbFC7ArZDAXlg"
          name="google-site-verification"
        />
        <meta property="og:title" content={props.title || t("t.dahliaSanFranciscoHousingPortal")} />
        {props.description && <meta property="og:description" content={props.description} />}
        {props.description && <meta name="description" content={props.description} />}
        <meta
          property="og:image"
          content={props.image || getAssetPath("dahlia_social-media-preview.jpg")}
        />
        <meta property="og:type" content="website" />
        <link href={getAssetPath("apple-icon-57x57.png")} rel="apple-touch-icon" sizes="57x57" />
        <link href={getAssetPath("apple-icon-60x60.png")} rel="apple-touch-icon" sizes="60x60" />
        <link href={getAssetPath("apple-icon-72x72.png")} rel="apple-touch-icon" sizes="72x72" />
        <link href={getAssetPath("apple-icon-76x76.png")} rel="apple-touch-icon" sizes="76x76" />
        <link
          href={getAssetPath("apple-icon-114x114.png")}
          rel="apple-touch-icon"
          sizes="114x114"
        />
        <link
          href={getAssetPath("apple-icon-120x120.png")}
          rel="apple-touch-icon"
          sizes="120x120"
        />
        <link
          href={getAssetPath("apple-icon-144x144.png")}
          rel="apple-touch-icon"
          sizes="144x144"
        />
        <link
          href={getAssetPath("apple-icon-152x152.png")}
          rel="apple-touch-icon"
          sizes="152x152"
        />
        <link
          href={getAssetPath("apple-icon-180x180.png")}
          rel="apple-touch-icon"
          sizes="180x180"
        />
        <link
          href={getAssetPath("android-icon-192x192.png")}
          rel="icon"
          sizes="192x192"
          type="image/png"
        />
        <link href={getAssetPath("favicon-32x32.png")} rel="icon" sizes="32x32" type="image/png" />
        <link href={getAssetPath("favicon-96x96.png")} rel="icon" sizes="96x96" type="image/png" />
        <link href={getAssetPath("favicon-16x16.png")} rel="icon" sizes="16x16" type="image/png" />
        <link href={getAssetPath("manifest.json")} rel="manifest" />
        <meta content={getAssetPath("ms-icon-144x144.png")} name="msapplication-TileImage" />
      </HelmetProvider>
    </>
  )
}

export default MetaTags
