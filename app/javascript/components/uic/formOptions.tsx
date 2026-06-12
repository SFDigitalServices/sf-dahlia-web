// Vendored from @bloom-housing/ui-components src/helpers/formOptions.tsx
import * as React from "react"
import { t } from "./translator"
import { SelectOption } from "./Select"

export interface FormOptionsProps {
  options: (string | SelectOption)[]
  keyPrefix?: string
  strings?: {
    selectOne?: string
  }
}

export const numberOptions = (end: number, start = 1): SelectOption[] => {
  const nums = []
  for (let i = start; i <= end; i++) {
    nums.push({ label: i.toString(), value: i.toString() })
  }

  return nums
}

export const FormOptions = (props: FormOptionsProps) => {
  const options = props.options.map((option: string | SelectOption) => {
    return option == "" || option["value"] == "" ? (
        <option value="" key="select-one">
          {props.strings?.selectOne ?? t("t.selectOne")}
        </option>
      ) : (
        <option value={option["value"] || option} key={option["value"] || option}>
          {option["label"] || t(`${props.keyPrefix}.${option as string}`)}
        </option>
      )
  })
  return <>{options}</>
}
