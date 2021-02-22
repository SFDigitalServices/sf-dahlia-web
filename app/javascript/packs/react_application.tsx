// Run this example by adding <%= javascript_pack_tag 'hello_react' %> to the head of your layout file,
// like app/views/layouts/application.html.erb. All it does is render <div>Hello React</div> at the bottom
// of the page.

// import React from 'react'
// import ReactDOM from 'react-dom'
// import PropTypes from 'prop-types'

// const Hello = props => (
//   <div>Hello {props.name}!</div>
// )

// Hello.defaultProps = {
//   name: 'David'
// }

// Hello.propTypes = {
//   name: PropTypes.string
// }

// document.addEventListener('DOMContentLoaded', () => {
//   ReactDOM.render(
//     <Hello name="React" />,
//     document.body.appendChild(document.createElement('div')),
//   )
// })

import WebpackerReact from 'webpacker-react'

import index from '../pages/basic'

import * as translation from "@bloom-housing/ui-components/src/locales/general.json"
import * as customTranslations from "../page_content/locale_overrides/general.json"
import { addTranslation } from '@bloom-housing/ui-components'
addTranslation(translation)
if (customTranslations) {
  addTranslation(customTranslations)
}

WebpackerReact.setup({ index }) // ES6 shorthand for {ApplicationEditPage: ApplicationEditPage}
