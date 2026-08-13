import React from "react"
import { Card } from "@bloom-housing/ui-seeds"
import Layout from "./Layout"
import styles from "./AuthLayout.module.scss"

export interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
}

const AuthLayout = ({ children, title }: AuthLayoutProps) => (
  <Layout title={title}>
    <section className={styles.authLayoutBackground}>
      <div className={styles.authLayoutContent}>
        <Card className={styles.card}>{children}</Card>
      </div>
    </section>
  </Layout>
)

export default AuthLayout
