import React, { useState, useContext } from "react"

import {
  AppearanceStyleType,
  Button,
  Field,
  Form,
  t,
  setSiteAlertMessage,
  FormCard,
  Icon,
  AlertBox,
  SiteAlert,
  LinkButton,
} from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"

import { UserContext } from "./UserContext"

const SignInForm = () => {
  const { signIn } = useContext(UserContext)
  /* Form Handler */
  // This is causing a linting issue with unbound-method, see open issue as of 10/21/2020:
  // https://github.com/react-hook-form/react-hook-form/issues/2887
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors } = useForm()
  const [requestError, setRequestError] = useState<string>()

  const onSubmit = async (data: { email: string; password: string }) => {
    const { email, password } = data

    try {
      const user = await signIn(email, password)
      setSiteAlertMessage(t(`authentication.signIn.success`, { name: user.email }), "success")
      // TODO replace with proper router
      window.location.href = "/?react=true"
      window.scrollTo(0, 0)
    } catch (error) {
      const { status } = error.response || {}
      if (status === 401) {
        setRequestError(`${t("authentication.signIn.error")}: ${error.message}`)
      } else {
        console.error(error)
        setRequestError(
          `${t("authentication.signIn.error")}. ${t("authentication.signIn.errorGenericMessage")}`
        )
      }
    }
  }

  return (
    <FormCard>
      <div className="form-card__lead text-center border-b mx-0">
        <Icon size="2xl" symbol="profile" />
        <h2 className="form-card__title">Sign In</h2>
      </div>
      {requestError && (
        <AlertBox className="" onClose={() => setRequestError(undefined)} type="alert">
          {requestError}
        </AlertBox>
      )}
      <SiteAlert type="notice" dismissable />
      <div className="form-card__group pt-0 border-b">
        <Form id="sign-in" className="mt-10" onSubmit={handleSubmit(onSubmit)}>
          <Field
            caps={true}
            name="email"
            label="Email"
            validation={{ required: true }}
            error={errors.email}
            errorMessage="Please enter your login email"
            register={register}
          />

          {/* TODO: Add /forgot-password link */}
          <aside className="float-right font-bold">
            {/* <Link href="/forgot-password">
                <a>{t("authentication.signIn.forgotPassword")}</a>
              </Link> */}
          </aside>

          <Field
            caps={true}
            name="password"
            label="Password"
            validation={{ required: true }}
            error={errors.password}
            errorMessage="Please enter your login password"
            register={register}
            type="password"
          />

          <div className="text-center mt-6">
            <Button
              styleType={AppearanceStyleType.primary}
              onClick={() => {
                //
              }}
            >
              Sign In
            </Button>
          </div>
        </Form>
      </div>
      <div className="form-card__group text-center">
        <h2 className="mb-6">Don't have an account?</h2>

        <LinkButton href="/create-account">Create Account</LinkButton>
      </div>
    </FormCard>
  )
}

export { SignInForm as default, SignInForm }
