import { Button } from "@bloom-housing/ui-seeds"
import React from "react"

interface FormSubmitButtonProps {
  loading: boolean
  label: string
}

const FormSubmitButton = ({ loading, label }: FormSubmitButtonProps) => {
  return (
    <div className="flex justify-center pt-2">
      <Button loadingMessage={loading ? label : undefined} type="submit" variant="primary-outlined">
        {label}
      </Button>
    </div>
  )
}

export default FormSubmitButton
