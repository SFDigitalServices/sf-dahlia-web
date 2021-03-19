# Dahlia

[![CircleCi Builds](https://app.circleci.com/pipelines/github/SFDigitalServices/sf-dahlia-web)](https://app.circleci.com/pipelines/github/SFDigitalServices/sf-dahlia-web)

Cross-browser testing done with <a href="https://www.browserstack.com/"><img src="./Browserstack-logo@2x.png?raw=true" height="30" ></a>

## Purpose

DAHLIA is the affordable housing portal for the City and County of San Francisco. It was created by the Mayor's Office of Housing and Community Development (MOHCD). This application streamlines the process of searching and applying for affordable housing, making it easier to rent, buy and stay in our City.

## Technical Architecture

### In-progress technical migration

We are currently in the process of migrating our app from AngularJS to React/TS.

The new, React codebase lives under app/javascript. Pages are routed via rails to load either react or angular versions of each page.

React pages will be released behind feature flags, see the **Rewrite feature flags** section of the readme for more information. On any page that has an in-progress react version, you can override the rewrite feature flag behavior by adding `?react=true` or `?react=false` to the url to force React or Angular rendering, respectively.

### Pre-migration

This repository contains the source code for [housing.sfgov.org](https://housing.sfgov.org), which is the user-facing web application of the DAHLIA platform. It is a [Ruby on Rails](http://rubyonrails.org/) application that serves up a single page [AngularJS](https://angularjs.org/) app. The web application connects to a Salesforce backend (you can find the source code for that [here](https://github.com/Exygy/sf-dahlia-salesforce)), which is where the listings are actually created and administered. The primary purpose of the PostgreSQL database on the web application is to serve as user authentication (using [Devise](https://github.com/plataformatec/devise) + [Devise Token Auth](https://github.com/lynndylanhurley/devise_token_auth)), with every user in the database getting a `salesforce_contact_id` which corresponds to their record in the Salesforce database.

![Architecture Diagram](https://www.lucidchart.com/publicSegments/view/61f66aec-5d56-442b-8e46-9b2ff8316f97/image.jpeg)
See [here](https://www.lucidchart.com/documents/view/53cd191b-3ca5-4b23-832d-28a6591500f2) for the original Lucidchart of the above diagram

## Dependencies

Before you install DAHLIA, your system should have the following:

- [Ruby](https://www.ruby-lang.org/en/documentation/installation/) 2.5.3 (Use [RVM](https://rvm.io/rvm/install) or [rbenv](https://github.com/rbenv/rbenv))
- [Bundler](https://github.com/bundler/bundler) `gem install bundler`
- [Homebrew](http://brew.sh)
- [PostgreSQL](https://postgresapp.com/)
- [Node.js](https://nodejs.org/en/) 12.16.x
  - Installing node with nvm is recommended. See [installing NVM and node.js on MacOS](https://stackoverflow.com/a/28025834/260495).
- [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)
  - After node is installed, you can install yarn with `npm install --global yarn`

## Getting started

1. Make sure your PostgreSQL server is running (e.g. using [Postgres.app](https://postgresapp.com/) listed above)
1. Open a terminal window
1. `git clone https://github.com/SFDigitalServices/sf-dahlia-web.git` to create the project directory
1. `cd sf-dahlia-web` to open the directory
1. `bundle install` to download all necessary gems
   - see [here](https://stackoverflow.com/a/19850273/260495) if you have issues installing `pg` gem with Postgres.app, you may need to use: `gem install pg -v <failing-pg-version> -- --with-pg-config=/Applications/Postgres.app/Contents/Versions/latest/bin/pg_config`
   - if you need to run this command make sure you run bundle install again following the success of the Postgres installation to install the remaining gems
1. `yarn install` to install bower, grunt and other dependencies (which will also automatically `bower install` to load front-end JS libraries)
1. `overcommit --install` to install git hooks into the repo
1. `rake db:create && rake db:migrate` to create the dev database and migrate the DB tables
1. copy `.env.sample` into a file called `.env`, and copy correct Salesforce environment credentials (not shared publicly in this repo)
1. `./bin/webpack-dev-server` to start the webpack dev server
    - This command might fail with `Command "webpack-dev-server" not found.`. In that case, you'll need to reinstall webpacker with `bundle exec rails:webpacker:install`. During the install it will ask if you want to overwrite a few config files, do not overwrite them.
1. In another terminal tab, run `rails s` to start the rails server, which will now be running at http://localhost:3000 by default

## How to migrate a page from AngularJS to React
### Adding rails routes and react components
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
1. Tell Webpack that component is an entrypoint by importing and adding the component to the `WebpackerReact.setup({})` object in [react_application.tsx](app/javascript/packs/react_application.tsx)
1. Visit your url and append the `?react=true` option to it. This will force render the react view, check to make sure your react page component is rendering as expected.
1. Visit your url and append the `?react=false` option to it. This will force render the Angular view, check to make sure the legacy page is rendering as expected.
1. Update your local `~/.env` file to include YOUR_ENV_VAR_NAME=true
    - For now, this just makes it easier to test routing between pages, since the ?react=true param won't persist when you click a link.

### Update Angular to route between React and AngularJS correctly
Because our legacy code is frontend-routed in AngularJS, links from one angular page to our new react page won't work properly, they'll always render the AngularJS version of the linked page. So, we need to tell Angular to revert to rails routing when navigating to our new page.
1. Each Angular page corresponds to a state name. For example the home page state name is `dahlia.welcome`. Find which state name corresponds to the url you're replacing by going to [angularRoutes.js.coffee](app/assets/javascripts/config/angularRoutes.js.coffee) and finding the case that matches your url.
1. Search for all usages of that state in the repo and update them in different ways depending on the usage:
    - **Case:** In an `html.slim` file as a `ui-sref` attr. Replace `ui-sref="state.name"` with `href="your/relative/url"` and add a new attr `target="_self"`
      - Setting the target is a hacky way to ignore the angular router/state transitions and treat it as an external link.
    - **Case:** In a `$state.go('new.state')` call. Replace `$state.go('new.state')` with `$window.location.href = 'your/relative/url'`
      - You may need to inject $window in whatever service you're in if it's not already present.
1. Test that the new routing works by starting on an angular page, and navigate to your new page via a link in Angular. Verify the react page loads correctly.

## Running Tests

To run ruby tests:

- `rake spec`

To run javascript unit tests:

- `rake jasmine:ci` to run in terminal
- `rake jasmine` to then run tests interactively at http://localhost:8888/

To run E2E tests:

- Installation (needs to be run once): `./node_modules/protractor/bin/webdriver-manager update --versions.chrome 2.41 --versions.standalone 3.141.59` to get the selenium webdriver installed
- On one tab have your Rails server running: `rails s`
- On another tab, run `yarn protractor` to run the selenium webdriver and protractor tests. A Chrome browser will pop up and you will see it step through each of the tests.

Note: These tests will run on [CircleCi](https://app.circleci.com/pipelines/github/SFDigitalServices/sf-dahlia-web) as well for every review app and QA deploy.

## Importing pattern library styles

We currently manually transfer the application's CSS from [our pattern library](https://github.com/Exygy/sf-dahlia-pattern-library) using Grunt.

If you do not already have grunt installed, run `brew install grunt` to install it before proceeding.

To update this app with the latest PL styles:

1. [Clone the PL repository in the same parent directory as this one.](https://github.com/Exygy/sf-dahlia-pattern-library)
2. Switch to the PL branch you want to import styles from, either main or a specific branch
3. Run `npm run-script build` in the pattern lib directory to compile the css
4. `cd` to your `sf-dahlia-web` folder
5. Run `grunt`
6. Commit the updates to toolkit.scss with a reference to the commit you're updating from on pattern-lib

We use `grunt-clean` and `grunt-copy` to transfer the CSS, and `grunt-replace` to replace relative background image paths with Rails asset URLs.

## Running with a cache locally

In order to test caching locally,

1. Install memcached locally with `brew install memcached`
1. Start memcached in a new tab by running `memcached`
1. Add an empty file to the repo route named `tmp/caching-dev.txt`
1. Set CACHE_SALESFORCE_REQUESTS='true' in your .env
1. Start up the app

## Running stress testing against Salesforce

To run stress testing against the Salesforce instance, refer to the documentation in the [stress testing folder](load_testing/load_testing.md)

## Translations process with [Phrase](https://app.phrase.com/accounts/city-county-of-san-francisco/projects/dahlia-sf-dahlia-web/dashboard)

To get started working with our Phrase translations, you will need to:

1. Install the Phrase CLI with `brew tap phrase/brewed && brew install phrase`
1. [Create an access token for Phrase](https://app.phrase.com/settings/oauth_access_tokens). Save it for future use in Lastpass and as a local env var.
1. Save the access token as an env var so you don't have to pass it to the phrase commands: `export PHRASE_ACCESS_TOKEN="YOUR_ACCESS_TOKEN"`

### Push your changes to Phrase every time you update locale-en.json

After running `grunt translations`, run `grunt phrasePush` to push to Phrase each time you update locale-en.json to keep Phrase up-to-date

Special cases:

- If you changed the meaning or intent of an existing English string, you should delete the existing non-English translations in Phrase and run `grunt phrasePull` so users don't get incorrect info.
- If you updated an English string but it doesn't change the meaning or intent of the string then you don't need to delete the existing translations. Phrase will automatically mark the translations in other languages as "unverified".
- If you deleted a key in locale-en.json, run phrase cleanup after you push to delete the now-unused key `phrase uploads cleanup --id=[upload id from phrase push log]`
- If you re-named a key, we treat that the same as deleting the old key and adding a new one. After you run `grunt phrasePush` and `phrase cleanup`, follow the instructions below to update the translations and pull them down.

### Make your updates in Phrase if you need to update non-English locale files

If you want to update translations in a non-English locale file, you need to make your changes in Phrase, then pull down the updated translations.

You have to do this if you rename a key too. If you renamed a key in locale-en.json, you need to push your change to Phrase, then update the translations for the new key in Phrase and pull those translations down following the instructions below

### How to download new translations from Phrase

If we have new verified translations in Phrase, run `grunt phrasePull` to get the latest translations

## Releases

Follow the [Webapp release process](https://sfgovdt.jira.com/wiki/spaces/HOUS/pages/1851752601/Webapp+Release+Template) page on Confluence for the full release guide.

### Release script: create_release_branch

Command: `bash create_release_branch.sh` from the webapp repo root.

This script will:

- Create a new branch named `release-<todays-date>`
- Merge it with the latest main
- Open a PR in a browser window

## Environment variable configurations

### DALP Advertising

- ADVERTISE_DALP -> If set to 'true', the Sales directory page will display info about applying to DALP in a "Help with downpayments" section. Otherwise it'll show the plain "Get help" section
- DALP_PROGRAM_INFO -> If provided, we will override the default DALP text of "The 2021 Downpayment Assistance Loan Program (DALP) will begin accepting applications on February 26, 2021." with whatever is in this env var.

### Rewrite feature flags

We have flags for each chunk of the rewrite we release. These will set those pages to default to the React version. This can be overridden with

- HOME_PAGE_REACT='true'

### Other

- SHOW_RESEARCH_BANNER - If set to 'true', it displays research banner.
- COVID_UPDATE -> If set to 'true', shows COVID-19 update info in the apply section and hides pre lottery info

## Contributing changes

Use the engineering workflow and coding style standards established below. :smiley:

### Acceptance/Feature Apps

Temporary "acceptance" apps are created upon opening a pull request for a feature branch. After the pull request is closed, the acceptance app is automatically spun down. See [this Heroku article](https://devcenter.heroku.com/articles/github-integration-review-apps) for details.

### Code style and quality

#### Javascript

Javascript code quality is ensured by two npm packages: JsHint and JSCS. They will run automatically as a pre-commit hooks. Follow the [Airbnb JavaScript Style guide](http://nerds.airbnb.com/our-javascript-style-guide/).

#### Ruby

[Rubocop](https://github.com/bbatsov/rubocop) is configured in `.rubocop.yml` to enforce code quality and style standards based on the [Ruby Style Guide](https://github.com/bbatsov/ruby-style-guide) and runs every time you commit using a pre-commit hook. Refer to the [Ruby Style Guide](https://github.com/bbatsov/ruby-style-guide) for all Ruby style questions.
To identify and have Rubocop automatically correct violations when possible, run:

- `rubocop -a [path_to_file]` for individual files
- `rubocop -a` for all Ruby files

### Changing the Style Guide settings

Any changes to Rubocop, JSCS, etc. affect the entire team, so it should be a group decision before commiting any changes. Please don't commit changes without discussing with the team first.

### VS Code Setup

To take full advantage of javascript/ typescript linting you can make VS Code format code on save. First install `Prettier - Code formatter` extension.
You can turn on format-on-save on a per-language basis by scoping the setting:

```
// Set the default
"editor.formatOnSave": false,
// Enable per-language
"[javascript]": {
    "editor.formatOnSave": true
}
```

Recomended extensions:

- Auto Import
- Auto Import - ES6, TS, JSX, TSX
- ESLint
- Prettier - Code formatter

### Credits

### License

Copyright (C) 2015 City and County of San Francisco

DAHLIA is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with DAHLIA. If not, see [http://choosealicense.com/licenses/gpl-3.0/](http://choosealicense.com/licenses/gpl-3.0/)
