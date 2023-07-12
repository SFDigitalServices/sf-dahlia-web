# Migrating an angular page to react

## Creating the new react page

1. Create a new controller file (ex: [home_controller.rb](app/controllers/home_controller.rb)) and override the `use_react_app` method to do an environment variable check
   ```
   def use_react_app
     ENV['YOUR_ENV_VAR_NAME'].to_s.casecmp('true').zero?
   end
   ```
1. Add a new view for that controller (ex: [home/index.html.slim](app/views/home/index.html.slim)) under app/views/<your-controller-name>/index.html.slim
   - The view should just be a single line to render a React page component
   ```
   == react_component 'YourPageComponentName', { prop1: "prop1", prop2: "prop2" }
   ```
1. Add a route to [routes.rb](config/routes.rb) for your new url. Before, that route would fall back to the angular controller, but you're telling rails to load your new controller instead.
   - **Important:** you must add this line _before_ the fallback route at the very end of the routes file.
   - This url should be the same as the angular url you're replacing
1. Add a new react component file at `app/javascript/pages/YourPageComponentName.tsx` (ex [pages/HomePage.tsx](app/javascript/pages/HomePage.tsx))
1. Tell Webpack that component is an entrypoint by importing and adding the component to the `ReactOnRails.register({})` object in [react_application.tsx](app/javascript/packs/react_application.tsx)
1. Visit your url and append the `?react=true` option to it. This will force render the react view, check to make sure your react page component is rendering as expected.
1. Visit your url and append the `?react=false` option to it. This will force render the Angular view, check to make sure the legacy page is rendering as expected.
1. Update your local `~/.env` file to include YOUR_ENV_VAR_NAME=true
   - For now, this just makes it easier to test routing between pages, since the ?react=true param won't persist when you click a link.
   - You'll want to keep the heroku env variables either to unset or "false" until you actually want to launch the page to the public.

## Update Angular to route to your new page

Because our legacy code is frontend-routed in AngularJS, links from one angular page to our new react page won't work properly, they'll always render the AngularJS version of the linked page. So, we need to tell Angular to revert to rails routing when navigating to our new page.

1. Pass `YOUR_ENV_VAR_NAME` to the AngularJS frontend in [application-angular.html.slim](app/views/layouts/application-angular.html.slim).
1. Each Angular page corresponds to a state name. For example the home page state name is `dahlia.welcome`. Find which state name corresponds to the url you're replacing by going to [angularRoutes.js.coffee](app/assets/javascripts/config/angularRoutes.js.coffee) and finding the case that matches your url.
   - Pay attention to any additional query parameters that are supported, you'll have to be sure not to break those!
1. Update the `railsRoutedPages` object to add support for the state you just added
   - The key should be the state name (ex: `dahlia.welcome`)
   - The `buildUrl` field should be a function that builds the new href url. Note that you'll need to support the language path and any query params here!
   - The `shouldRailsRoute` field should be a function that returns true only if `YOUR_ENV_VAR_NAME` flag is true and it is not the first page load.
     - _Why do we do a check for isFirstPageLoad?_ We only do this to make sure `?react=false` properly renders the angular page even if the env flag is set to "true".
1. Test that the new routing works by starting on an angular page, and navigate to your new page via a link in Angular. Verify the react page loads correctly.
