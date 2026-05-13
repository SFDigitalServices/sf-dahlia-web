import * as React from "react"
import { useSignUp, useSignIn } from "@clerk/react"
import { Field, Form } from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"
import { Card, Heading, Link, Button, FormErrorMessage } from "@bloom-housing/ui-seeds"
import { getAssistancePath } from "../util/routeUtil"
import styles from "./ClerkSignInForm.module.scss"
import ClerkVerifyCode from "./ClerkVerifyCode"

export const ClerkSignInForm = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { handleSubmit, errors, register } = useForm({ reValidateMode: "onSubmit" })
  const { signUp } = useSignUp()
  const { signIn } = useSignIn()
  const [showVerifyForm, setShowVerifyForm] = React.useState<"email" | "phone" | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const onSubmit = async (data: { signInField: string }) => {
    const signInField = data.signInField
    //First try to sign in
    const { error } = await signIn.create({ identifier: signInField })
    if (error) {
      console.error("Error signing in", data, error)
      //No account found - sign up instead
      await signUp.create({ emailAddress: signInField })
    } else {
      //Account found - move to verification page
      await signIn.emailCode.sendCode()
      setShowVerifyForm("email")
      return
    }
  }
  if (showVerifyForm) {
    return <ClerkVerifyCode fieldType={showVerifyForm} />
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
            />
            {errors.signInField?.message && (
              <FormErrorMessage>{errors.signInField.message}</FormErrorMessage>
            )}
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
