// Vendored from @bloom-housing/ui-components src/helpers/translator.tsx
import Polyglot from "node-polyglot"
import { addTranslation as addPackageTranslation } from "@bloom-housing/ui-components"

interface TranslatorConfig {
  polyglot?: Polyglot
}

const translatorConfig: TranslatorConfig = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).Translator = translatorConfig

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addTranslation = (translationPhrases: any, resetPolyglot = false) => {
  // Components not yet vendored (still re-exported from the package by the uic
  // barrel) call the package's internal `t`, which reads from the package's own
  // polyglot instance — keep it fed until the last package component is migrated.
  addPackageTranslation(translationPhrases, resetPolyglot)

  if (!translatorConfig.polyglot || resetPolyglot) {
    // Set up the initial Polyglot instance and phrases
    translatorConfig.polyglot = new Polyglot({
      phrases: translationPhrases,
    })
  } else {
    // Extend the Polyglot instance with new phrases
    translatorConfig.polyglot.extend(translationPhrases)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const t = (phrase: string, options?: any): string => {
  if (translatorConfig.polyglot) {
    return translatorConfig.polyglot.t(phrase, options)
  }
  return "{{ Missing Translation Phrases }}"
}

export { t as default, t }
