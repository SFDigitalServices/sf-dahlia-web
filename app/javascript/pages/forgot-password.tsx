import React, { useState } from "react"
import { AppearanceStyleType, Button, Form, t, FormCard, Icon } from "@bloom-housing/ui-components"
import { Link, Heading, Alert } from "@bloom-housing/ui-seeds"
import { useForm } from "react-hook-form"
import { getSignInPath } from "../util/routeUtil"
import EmailFieldset from "../pages/account/components/EmailFieldset"
import "../pages/account/styles/account.scss"
import FormsLayout from "../layouts/FormLayout"
import withAppSetup from "../layouts/withAppSetup"
import { forgotPassword } from "../api/authApiService"
const EmailSubmittedCard = () => {
  return (
    <div className="text-center p-8">
      <Heading priority={3} size="2xl" className="mb-4">
        {t("forgotPassword.emailSent")}
      </Heading>
      <p>{t("forgotPassword.emailLink")}</p>
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

const ForgotPassword = () => {
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors } = useForm()
  const onSubmit = (data: { email: string }) => {
    forgotPassword(data.email)
      .then(() => {
        setEmailSubmitted(true)
      })
      .catch((error) => {
        if (error.response?.status !== 404) {
          setServerError(t("error.account.genericServerError"))
        } else {
          setEmailSubmitted(true)
        }
      })
  }

  const urlParams = new URLSearchParams(window.location.search)
  const emailParam = urlParams.get("email") || undefined

  return (
    <FormsLayout>
      <ServerAlert message={serverError} />
      <FormCard>
        <div className="form-card__lead text-center border-b mx-0">
          <Icon size="2xl" symbol="profile" />
          <h2 className="form-card__title">{t("pageTitle.forgotPasswordLowercase")}</h2>
          <p className="form-subtitle">{t("forgotPassword.subtitle")}</p>
        </div>
        {!emailSubmitted ? (
          <div className="form-card__group pt-0">
            <Form className="mt-10 relative" onSubmit={handleSubmit(onSubmit)}>
              <EmailFieldset defaultEmail={emailParam} register={register} errors={errors} />
              <div className="text-center mt-4">
                <Button styleType={AppearanceStyleType.primary} type="submit">
                  {t("label.sendEmail")}
                </Button>
              </div>
              <div className="text-center mt-4">
                <Link href={getSignInPath()}>{t("label.cancel")}</Link>
              </div>
            </Form>
          </div>
        ) : (
          <EmailSubmittedCard />
        )}
      </FormCard>
    </FormsLayout>
  )
}

export default withAppSetup(ForgotPassword, true)
