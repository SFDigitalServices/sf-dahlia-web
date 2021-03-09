import WebpackerReact from 'webpacker-react'
import '../pages/base.scss'

import index from '../pages/index'

import * as translation from "@bloom-housing/ui-components/src/locales/general.json"
import * as customTranslations from "../page_content/locale_overrides/general.json"
import { addTranslation } from '@bloom-housing/ui-components'

addTranslation(translation)
if (customTranslations) {
  addTranslation(customTranslations)
}

WebpackerReact.setup({ index })
