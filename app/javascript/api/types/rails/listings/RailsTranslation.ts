export enum RailsTranslationLanguage {
  EN = "EN",
  ES = "ES",
  ZH = "ZH",
  TL = "TL",
}

export type RailsTranslation = {
  ES: string
  ZH: string
  TL: string
}

export type RailsTranslations = {
  [key: string]: RailsTranslation
}
