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
    <section className="bg-gray-300 md:border-t md:border-gray-450">
      <div className="flex flex-wrap relative md:max-w-lg mx-auto md:py-8">
        <Card className={styles.card}>{children}</Card>
      </div>
    </section>
  </Layout>
)

export default AuthLayout
