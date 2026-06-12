// Vendored from @bloom-housing/ui-components src/config/NavigationContext.tsx
import React, {
  createContext,
  FunctionComponent,
  AnchorHTMLAttributes,
  DetailedHTMLProps,
} from "react"
import { UrlObject } from "url"

type Url = UrlObject | string

type DefaultLinkProps = DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>

export interface LinkProps extends DefaultLinkProps {
  className?: string
}

export interface GenericRouterOptions {
  locale?: string
}

export interface GenericRouter {
  push: (url: Url, as?: Url, options?: GenericRouterOptions) => void
  back(): void
  pathname: string
  asPath: string
  locale?: string
}

export interface NavigationContextProps {
  LinkComponent: FunctionComponent<LinkProps>
  router: GenericRouter
}

export const NavigationContext = createContext<NavigationContextProps>({
  /* eslint-disable react/prop-types */
  LinkComponent: (props) => (
    <a className={props.className} {...props}>
      {props.children}
    </a>
  ),
  /* eslint-enable react/prop-types */
  router: {
    push: () => {
      // no-op
    },
    back: () => {
      // no-op
    },
    pathname: "",
    asPath: "",
    locale: "",
  },
})
