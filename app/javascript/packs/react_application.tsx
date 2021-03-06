import WebpackerReact from 'webpacker-react'
// import "@bloom-housing/ui-components/src/global/index.scss"
import '../pages/basic.scss'

import index from '../pages/basic'

import * as translation from "@bloom-housing/ui-components/src/locales/general.json"
import * as customTranslations from "../page_content/locale_overrides/general.json"
import { addTranslation } from '@bloom-housing/ui-components'
addTranslation(translation)
if (customTranslations) {
  addTranslation(customTranslations)
}

WebpackerReact.setup({ index }) // ES6 shorthand for {ApplicationEditPage: ApplicationEditPage}
