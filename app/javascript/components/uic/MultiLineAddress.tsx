// Vendored from @bloom-housing/ui-components src/helpers/MultiLineAddress.tsx
import * as React from "react"
import Markdown from "markdown-to-jsx"

export interface Address {
  city?: string
  latitude?: number
  longitude?: number
  placeName?: string
  state?: string
  street2?: string
  street?: string
  zipCode?: string
}

export interface MultiLineAddressProps {
  address: Address
}

const makeHtmlString = (address: Address) => {
  let str = ""

  if (address.placeName) {
    str += `${address.placeName} <br />`
  }

  if (address.street || address.street2) {
    str += `${address.street || ""} ${address.street2 || ""} <br />`
  }

  if (address.city || address.state || address.zipCode) {
    str += `${address.city ? `${address.city},` : ""} ${address.state || ""} ${
      address.zipCode || ""
    }`
  }

  return str
}

const MultiLineAddress = ({ address }: MultiLineAddressProps) => {
  if (!address) return null

  return (
    <Markdown options={{ disableParsingRawHTML: false }}>
      {`<span>${makeHtmlString(address)}</span>`}
    </Markdown>
  )
}

export { MultiLineAddress as default, MultiLineAddress }
