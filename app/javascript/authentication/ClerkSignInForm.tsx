import { SignIn } from "@clerk/react"
import { Card, Heading, Link } from "@bloom-housing/ui-seeds"
import React from "react"
import { getAssistancePath, getMyAccountPath } from "../util/routeUtil"
import styles from "./ClerkSignInForm.module.scss"

export const ClerkSignInForm = () => {
  return (
    <span className={styles.signIn}>
      <Card>
        <SignIn withSignUp forceRedirectUrl={getMyAccountPath()} />
      </Card>
      <Card>
        <Card.Header>
          <Heading priority={1} size="lg">
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
        <Card.Footer className={styles.footer}>
          <Link href={getAssistancePath()}>Get help</Link>
        </Card.Footer>
      </Card>
    </span>
  )
}

export default ClerkSignInForm
