import React, { ErrorInfo, ReactNode } from "react"
import { ActionBlock, AppearanceStyleType, Button, t } from "@bloom-housing/ui-components"
import "./ErrorBoundary.scss"
import { localizedPath } from "../util/routeUtil"

export enum BoundaryScope {
  /**
   * A small component on the page has an error. An error message will display where
   * the component would normally display.
   */
  component = "component",

  /**
   * The main content of the page will be wrapped in the error boundary, e.g. outside
   * wrapping components like header and footer should still show on the page
   */
  content = "content",

  /**
   * This is assumed critical. User will be redirected to an html error page.
   */
  page = "page",
}

interface Props {
  boundaryScope: BoundaryScope
  componentClassNames?: string
  children: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // TODO: add to papertrail or sentry integration
    console.debug(`Uncaught error with scope[${this?.props?.boundaryScope}]`, error, errorInfo)
  }

  render() {
    const classNames = this.props.componentClassNames
      ? `${this.props.componentClassNames}`
      : "p-4 text-center"
    if (this.state.hasError) {
      switch (this.props.boundaryScope) {
        case BoundaryScope.content:
          return (
            <ActionBlock
              className="error-boundary"
              header={t("errorBoundary.description")}
              actions={[
                <Button
                  onClick={() => (window.location.href = localizedPath("/"))}
                  styleType={AppearanceStyleType.info}
                  key="goHome"
                >
                  {t("errorBoundary.goHome")}
                </Button>,
              ]}
            />
          )
        case BoundaryScope.component:
          return <div className={classNames}>{t("errorBoundary.description")}</div>
        default:
          // Assume the worst if not specified. Will handle as a page level boundary
          window.location.replace("/500.html")
      }
    }

    return this.props.children
  }
}

export default ErrorBoundary
