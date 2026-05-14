import * as React from "react"
import { Field, Form } from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"
import { Card, Heading, Button, Alert } from "@bloom-housing/ui-seeds"
import { useSignIn } from "@clerk/react"
import { getMyAccountPath } from "../../util/routeUtil"
import cardStyles from "../ClerkSignInForm.module.scss"
import styles from "./EnterPassword.module.scss"

const onSubmit = async (
  data: { email: string; password: string },
  signIn: ReturnType<typeof useSignIn>["signIn"]
): Promise<void> => {
  console.log("User entered email and password", data)
  const { error } = await signIn.password({
    emailAddress: data.email,
    password: data.password,
  })
  if (error) {
    console.error("Password login failed", data.email, error)
  } else {
    console.log("Password login succeeded", data.email)
    await signIn.finalize()
    window.location.href = getMyAccountPath()
  }
}

export const EnterPassword = () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { handleSubmit, register } = useForm()
  const { signIn } = useSignIn()
  const [actionMessage, setActionMessage] = React.useState("")

  return (
    <Card className={cardStyles.authCard}>
      <Card.Header>
        <Heading priority={1} size="xl">
          Enter your password
        </Heading>
      </Card.Header>
      <Form
        onSubmit={handleSubmit((data) =>
          onSubmit({ email: data.email, password: data.password }, signIn)
        )}
      >
        <Card.Section>
          <Field register={register} name="email" label="Enter email" />
          <Field register={register} name="password" type="password" label="Enter password" />
          <Button variant="text" className={styles.forgotPassword}>
            Forgot password
          </Button>
          {actionMessage && (
            <Alert fullwidth variant="primary" onClose={() => setActionMessage("")}>
              {actionMessage}
            </Alert>
          )}
        </Card.Section>
        <Card.Section className={cardStyles.actionFooter}>
          <Button type="submit">Login</Button>
        </Card.Section>
      </Form>
      <Card.Footer className={cardStyles.linkFooter}>
        <Button variant="text">Or login without password</Button>
      </Card.Footer>
    </Card>
  )
}

export default EnterPassword
