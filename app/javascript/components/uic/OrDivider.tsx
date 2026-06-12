// Vendored from @bloom-housing/ui-components src/page_components/listing/listing_sidebar/OrDivider.tsx
import * as React from "react"
import { t } from "./translator"

const OrDivider = (props: { bgColor: string; strings?: { orString?: string } }) => (
  <div className="aside-block__divider">
    <span className={`bg-${props.bgColor} aside-block__conjunction`}>
      {props.strings?.orString ?? t("t.or")}
    </span>
  </div>
)

export { OrDivider as default, OrDivider }
