// React 19 removed the global `JSX` namespace from `@types/react`; it now lives at
// `React.JSX`. Our own code and several dependencies that ship their own types
// (react-hook-form 6, markdown-to-jsx, react-accessible-accordion, react-dropzone)
// still reference the global `JSX.*` names. This shim restores the global namespace
// by re-exporting `React.JSX`, per the React 19 upgrade guide, so those references
// keep resolving without editing vendored type definitions.
import type * as React from "react"

// React 19 also removed several long-deprecated type aliases. `markdown-to-jsx`'s
// bundled type definitions still reference `React.ReactChild` and `React.Props`, so
// re-add them via module augmentation (matching their React 18 definitions) to keep
// those vendored types compiling.
declare module "react" {
  type ReactChild = React.ReactElement | string | number
  interface Props<T> {
    children?: React.ReactNode
    key?: React.Key
    ref?: React.LegacyRef<T>
  }
}

declare global {
  namespace JSX {
    type ElementType = React.JSX.ElementType
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Element extends React.JSX.Element {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ElementClass extends React.JSX.ElementClass {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ElementAttributesProperty extends React.JSX.ElementAttributesProperty {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ElementChildrenAttribute extends React.JSX.ElementChildrenAttribute {}
    type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicClassAttributes<T> extends React.JSX.IntrinsicClassAttributes<T> {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
  }
}
