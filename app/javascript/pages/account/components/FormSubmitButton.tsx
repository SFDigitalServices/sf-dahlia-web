import { Button } from "@bloom-housing/ui-seeds"
import React from "react"
import styles from "./FormSubmitButton.module.scss"

interface FormSubmitButtonProps {
  loading: boolean
  label: string
}

const FormSubmitButton = ({ loading, label }: FormSubmitButtonProps) => {
  return (
    <div className={styles["form-submit-button"]}>
      <Button loadingMessage={loading ? label : undefined} type="submit" variant="primary-outlined">
        {label}
      </Button>
    </div>
  )
}

export default FormSubmitButton
