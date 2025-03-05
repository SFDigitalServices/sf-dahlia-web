import React from "react"

import { AppearanceStyleType, Button, Form, FormCard, Icon, t } from "@bloom-housing/ui-components"

import withAppSetup from "../layouts/withAppSetup"
import { Alert, Link } from "@bloom-housing/ui-seeds"
import FormLayout from "../layouts/FormLayout"
import { AppPages, getMyApplicationsPath, getSignInPath } from "../util/routeUtil"
import { useForm } from "react-hook-form"
import PasswordFieldset from "./account/components/PasswordFieldset"
import { resetPassword } from "../api/authApiService"
import UserContext from "../authentication/context/UserContext"

interface ResetPasswordProps {
  assetPaths: unknown
}

const CardTitle = () => {
  return (
    <div className="form-card__lead text-center border-b mx-0">
      <Icon size="2xl" symbol="profile" />
      <h2 className="form-card__title">{t("pageTitle.resetPassword.lowercase")}</h2>
    </div>
  )
}

const ServerAlert = ({ message }: { message?: string }) => {
  return (
    message && (
      <Alert fullwidth variant="alert" className="error-summary-banner">
        {message}
      </Alert>
    )
  )
}

const FormButtons = () => {
  return (
    <>
      <div className="text-center mt-4">
        <Button styleType={AppearanceStyleType.primary} type="submit">
          {t("resetPassword.updatePassword")}
        </Button>
      </div>
      <div className="text-center mt-4">
        <Link href={getSignInPath()}>{t("label.cancel")}</Link>
      </div>
    </>
  )
}

const ResetPassword = (_props: ResetPasswordProps) => {
  const [serverError, setServerError] = React.useState<string | null>(null)
  const { profile, loading: authLoading, initialStateLoaded } = React.useContext(UserContext)
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors, watch } = useForm()

  if (!profile && !authLoading && initialStateLoaded) {
    window.location.href = getSignInPath()
    return null
  }

  const onSubmit = (data: { password: string }) => {
    // TODO: DAH-2987 API integration
    resetPassword(data.password)
      .then(() => {
        window.location.href = getMyApplicationsPath()
      })
      .catch(() => {
        setServerError(t("error.account.genericServerError"))
      })
  }

  return (
    <FormLayout>
      <FormCard>
        <CardTitle />
        <ServerAlert message={serverError} />
        <div className="form-card__group pt-0 border-b">
          <Form className="mt-10 relative" onSubmit={handleSubmit(onSubmit)}>
            <PasswordFieldset
              register={register}
              errors={errors}
              watch={watch}
              labelText={t("label.chooseNewPassword")}
              passwordType="resetPassword"
            />
            <FormButtons />
          </Form>
        </div>
      </FormCard>
    </FormLayout>
  )
}

export default withAppSetup(ResetPassword, {
  useFormTimeout: true,
  pageName: AppPages.ResetPassword,
})
