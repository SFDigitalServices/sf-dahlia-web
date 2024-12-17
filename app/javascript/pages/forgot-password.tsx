import React, { useState } from "react"
import { AppearanceStyleType, Button, Form, t, FormCard, Icon } from "@bloom-housing/ui-components"
import { Link, Heading } from "@bloom-housing/ui-seeds"
import { useForm } from "react-hook-form"
import { getSignInPath } from "../util/routeUtil"
import EmailFieldset from "../pages/account/components/EmailFieldset"
import "../pages/account/styles/account.scss"
import FormsLayout from "../layouts/FormLayout"
import withAppSetup from "../layouts/withAppSetup"

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

const ForgotPassword = () => {
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors } = useForm()
  const onSubmit = () => {
    setEmailSubmitted(true)
    // TODO: DAH-2984 API integration
  }
  return (
    <FormsLayout>
      <FormCard>
        <div className="form-card__lead text-center border-b mx-0">
          <Icon size="2xl" symbol="profile" />
          <h2 className="form-card__title">{t("pageTitle.forgotPasswordLowercase")}</h2>
        </div>
        {!emailSubmitted ? (
          <div className="form-card__group pt-0 border-b">
            <Form className="mt-10 relative" onSubmit={handleSubmit(onSubmit)}>
              <EmailFieldset register={register} errors={errors} />
              <div className="text-center mt-4">
                <Button styleType={AppearanceStyleType.primary} type="submit">
                  {t("pageTitle.signIn")}
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
