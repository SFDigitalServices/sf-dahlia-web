import { Button } from "@bloom-housing/ui-components"
import React from "react"

interface FormSubmitButtonProps {
  loading: boolean
  label: string
}

const FormSubmitButton = ({ loading, label }: FormSubmitButtonProps) => {
  return (
    <div className="flex justify-center">
      <Button loading={loading} type="submit">
        {label}
      </Button>
    </div>
  )
}

export default FormSubmitButton
