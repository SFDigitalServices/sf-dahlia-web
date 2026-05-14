import * as React from "react"
import { useSignUp, useSignIn } from "@clerk/react"
import { Field, Form } from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"
import { Card, Heading, Link, Button } from "@bloom-housing/ui-seeds"
import { getAssistancePath } from "../util/routeUtil"
import styles from "./ClerkSignInForm.module.scss"
import VerifyCode from "./components/VerifyCode"
import { isValidEmail, isValidPhone } from "../util/authUtil"

export const ClerkSignInForm = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { handleSubmit, errors, register } = useForm({ reValidateMode: "onSubmit" })
  const { signUp } = useSignUp()
  const { signIn } = useSignIn()
  const [showVerifyCode, setShowVerifyCode] = React.useState(false)
  const [loginMethod, setLoginMethod] = React.useState<"email" | "phone" | null>(null)
  const [loginType, setLoginType] = React.useState<"signIn" | "signUp" | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const onSubmit = async (data: { signInField: string }) => {
    const signInField = data.signInField
    if (isValidEmail(signInField)) {
      setLoginMethod("email")
    } else if (isValidPhone(signInField)) {
      setLoginMethod("phone")
    }
    //First try to login
    const { error } = await signIn.create({ identifier: signInField })
    if (error) {
      console.error("Could not sign in", data, error)
      // If login fails, create an account
      setLoginType("signUp")
      if (loginMethod === "email") {
        await signUp.verifications.sendEmailCode()
      } else if (loginMethod === "phone") {
        await signUp.verifications.sendPhoneCode()
      }
    } else {
      setLoginType("signIn")
      // If login succeeds, send verification code
      if (loginMethod === "email") {
        await signIn.emailCode.sendCode()
      } else if (loginMethod === "phone") {
        await signIn.phoneCode.sendCode()
      }
    }
    setShowVerifyCode(true)
  }

  if (showVerifyCode) {
    return <VerifyCode loginMethod={loginMethod} loginType={loginType} />
  }
  return (
    <span className={styles.signIn}>
      <Card className={styles.signInCard}>
        <Card.Header className={styles.actionCardHeader}>
          <Heading priority={1} size="xl">
            Sign in or create an account
          </Heading>
        </Card.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Card.Section>
            <Field
              register={register}
              name="signInField"
              label="Email or phone number"
              type="text"
              error={!!errors?.signInField}
              errorMessage={errors?.signInField?.message}
              validation={{
                required: true,
                validate: (data: string) => {
                  if (!isValidEmail(data) && !isValidPhone(data)) {
                    return "Please enter a valid email or phone number"
                  }
                },
              }}
            />
          </Card.Section>
          <Card.Footer className={styles.actionFooter}>
            <Button type="submit">Continue</Button>
          </Card.Footer>
        </Form>
      </Card>
      <Card className={styles.signInCard}>
        <Card.Header>
          <Heading priority={1} size="xl">
            Accounts are awesome because you can:
          </Heading>
        </Card.Header>
        <Card.Section>
          <ol className="numbered-list">
            <li>Save and finish later</li>
            <li>Not need to re-upload stuff</li>
            <li>Check your lottery results</li>
            <li>Get communications from leasing agents</li>
          </ol>
        </Card.Section>
        <Card.Footer className={styles.infoFooter}>
          <Link href={getAssistancePath()}>Get help</Link>
        </Card.Footer>
      </Card>
    </span>
  )
}

export default ClerkSignInForm
