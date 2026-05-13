import * as React from "react"
import { Field, Form } from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"
import { Card, Heading, Button } from "@bloom-housing/ui-seeds"
import styles from "./ClerkVerifyCode.module.scss"
import { useSignIn } from "@clerk/react"
import { getMyAccountPath } from "../util/routeUtil"

interface ClerkVerifyCodeProps {
  fieldType: "phone" | "email"
}
const onSubmit = async (
  data: { code: string },
  signIn: ReturnType<typeof useSignIn>["signIn"]
): Promise<void> => {
  console.log("User entered code", data)
  const { error } = await signIn.emailCode.verifyCode({ code: data.code })
  if (error) {
    console.error("Verification failed for code", data.code, error)
  } else {
    console.log("Verification succeeded for code", data.code)
    await signIn.finalize()
    window.location.href = getMyAccountPath()
  }
}

export const ClerkVerifyCode = ({ fieldType }: ClerkVerifyCodeProps) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { handleSubmit, register } = useForm()
  const { signIn } = useSignIn()

  const [showWays, setShowWays] = React.useState(false)

  return (
    <Card className={styles.verifyCard}>
      <Card.Header>
        <Heading priority={1} size="xl">
          Sent a code to your {fieldType}
        </Heading>
      </Card.Header>
      <Form onSubmit={handleSubmit((data) => onSubmit({ code: data.code }, signIn))}>
        <Card.Section>
          <Field register={register} name="code" label="Enter code" />
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <Button variant="text" onClick={() => signIn.emailCode.sendCode()}>
            Resend code
          </Button>
        </Card.Section>
        <Card.Section className={styles.actionFooter}>
          <Button type="submit">Submit</Button>
        </Card.Section>
      </Form>
      <Card.Footer>
        <Button variant="text" onClick={() => setShowWays(true)}>
          Try a different way
        </Button>
      </Card.Footer>
      {showWays && (
        <Card.Footer>
          <Button>Use password</Button>
          <Button>Send a code to your phone</Button>
        </Card.Footer>
      )}
    </Card>
  )
}

export default ClerkVerifyCode
