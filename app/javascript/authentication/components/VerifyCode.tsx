import * as React from "react"
import { Field, Form } from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"
import { Card, Heading, Button, Alert } from "@bloom-housing/ui-seeds"
import styles from "./VerifyCode.module.scss"
import cardStyles from "../ClerkSignInForm.module.scss"
import { useSignIn, useSignUp } from "@clerk/react"
import { getMyAccountPath } from "../../util/routeUtil"
import EnterPassword from "./EnterPassword"

interface VerifyCodeProps {
  loginMethod: "phone" | "email"
  loginType: "signIn" | "signUp"
}

const resendCode = (
  signIn: ReturnType<typeof useSignIn>["signIn"],
  loginMethod: "phone" | "email",
  setActionMessage: (message: string) => void
) => {
  if (loginMethod === "email") {
    return signIn.emailCode.sendCode().then(() => setActionMessage("Your code has been resent."))
  } else if (loginMethod === "phone") {
    return signIn.phoneCode.sendCode().then(() => setActionMessage("Your code has been resent."))
  }
}

export const VerifyCode = ({ loginMethod, loginType }: VerifyCodeProps) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { handleSubmit, register } = useForm()
  const { signIn } = useSignIn()
  const { signUp } = useSignUp()
  const [showWays, setShowWays] = React.useState(false)
  const [actionMessage, setActionMessage] = React.useState("")
  const [passwordLogin, setPasswordLogin] = React.useState(false)

  const onSubmit = async (data: { code: string }): Promise<void> => {
    console.log("User entered code", data)
    if (loginType === "signIn" && loginMethod === "email") {
      await signIn.emailCode.verifyCode({ code: data.code })
    } else if (loginType === "signIn" && loginMethod === "phone") {
      await signIn.phoneCode.verifyCode({ code: data.code })
    } else if (loginType === "signUp" && loginMethod === "email") {
      await signUp.verifications.verifyEmailCode({ code: data.code })
    } else if (loginType === "signUp" && loginMethod === "phone") {
      await signUp.verifications.verifyPhoneCode({ code: data.code })
    }
    console.log("Verification succeeded for code", data.code)
    await signIn.finalize()
    window.location.assign(getMyAccountPath())
  }

  if (passwordLogin) {
    return <EnterPassword />
  }
  return (
    <Card className={cardStyles.authCard}>
      <Card.Header>
        <Heading priority={1} size="xl">
          Sent a code to your {loginMethod}
        </Heading>
      </Card.Header>
      <Form onSubmit={handleSubmit((data) => onSubmit({ code: data.code }))}>
        <Card.Section className={styles.enterCode}>
          <Field register={register} name="code" label="Enter code" />
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <Button variant="text" onClick={() => resendCode(signIn, loginMethod, setActionMessage)}>
            Resend code
          </Button>
          {actionMessage && (
            <Alert
              fullwidth
              variant="primary"
              onClose={() => setActionMessage("")}
              className={styles.actionMessage}
            >
              {actionMessage}
            </Alert>
          )}
        </Card.Section>
        <Card.Section className={styles.actionFooter}>
          <Button type="submit">Submit</Button>
        </Card.Section>
      </Form>
      <Card.Footer className={styles.differentWaysButton}>
        <Button variant="text" onClick={() => setShowWays(true)}>
          Try a different way
        </Button>
      </Card.Footer>
      {showWays && (
        <Card.Footer className={styles.differentWays}>
          <Button variant="primary-outlined" onClick={() => setPasswordLogin(true)}>
            Use password
          </Button>
          <Button variant="primary-outlined">Send a code to your phone</Button>
        </Card.Footer>
      )}
    </Card>
  )
}

export default VerifyCode
