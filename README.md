# Dahlia

[![CircleCi Builds](https://app.circleci.com/pipelines/github/SFDigitalServices/sf-dahlia-web)](https://app.circleci.com/pipelines/github/SFDigitalServices/sf-dahlia-web)
[![QLTY Code Coverage](https://qlty.sh/badges/2ff5047d-ae66-4b94-b3cf-c8eae8f7e4a8/test_coverage.svg)](https://qlty.sh/gh/SFDigitalServices/projects/sf-dahlia-web)
[![QLTY Maintainability](https://qlty.sh/badges/2ff5047d-ae66-4b94-b3cf-c8eae8f7e4a8/maintainability.svg)](https://qlty.sh/gh/SFDigitalServices/projects/sf-dahlia-web)

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

## Dependencies

Before you install DAHLIA, your system should have the following:

- [Homebrew](http://brew.sh)
- [Ruby](https://www.ruby-lang.org/en/documentation/installation/) 3.4.1 (Use [RVM](https://rvm.io/rvm/install) or [rbenv](https://github.com/rbenv/rbenv))
  - For issues installing on an Apple Silicon mac, go [here](https://zwbetz.com/install-ruby-version-manager-on-mac/)
- [Bundler](https://github.com/bundler/bundler) `gem install bundler`
- [PostgreSQL](https://postgresapp.com/)
- [Node.js](https://nodejs.org/en/) 18.17.0
  - Installing node with nvm is recommended. See [installing NVM and node.js on MacOS](https://stackoverflow.com/a/28025834/260495).
- [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)
  - After node is installed, you can install yarn with `npm install --global yarn`

## Getting started

More information about getting started can be found on the team confluence.

1. Make sure your PostgreSQL server is running (e.g. using [Postgres.app](https://postgresapp.com/) listed above)
1. Open a terminal window
1. `git clone https://github.com/SFDigitalServices/sf-dahlia-web.git` to create the project directory
   - Using gh is recommended. This can be installed with either [Brew](https://brew.sh/) or downloading directly from [Github](https://cli.github.com/)
1. `cd sf-dahlia-web` to open the directory
1. Using NVM, install 18.7.0 (or whatever version we are on) with `nvm install 18.7.0`
1. Using RVM, install 3.4.1 (or whatever version we are on) with `rvm instal 3.4.1`
   - If you're having trouble with this command, try checking your openssl version:
     - `openssl version`
     - `brew install openssl@3`
     - `brew --prefix openssl@3`
     - `rvm install 3.4.1 --with-openssl-dir=$(brew --prefix openssl@3)`
     - `rvm use 3.4.1`
1. `bundle install` to download all necessary gems
   - See [here](https://stackoverflow.com/a/19850273/260495) if you have issues installing `pg` gem with Postgres.app, you may need to use: `gem install pg -v <failing-pg-version> -- --with-pg-config=/Applications/Postgres.app/Contents/Versions/latest/bin/pg_config`
   - If you need to run this command make sure you run `bundle install` again following the success of the Postgres installation to install the remaining gems
1. `yarn install` to install bower, grunt and other dependencies (which will also automatically `bower install` to load front-end JS libraries)
1. `overcommit --install` to install git hooks into the repo
1. Ensure PostgreSQL is running. You only need to turn it on, the next step will set it up for you.
1. copy `.env.sample` into a file called `.env`, and copy correct Salesforce and Unleash environment credentials (not shared publicly in this repo)
1. `rake db:create && rake db:migrate` to create the dev database and migrate the DB tables
1. Start Servers

- `yarn client` to start the webpack dev server alone
- `yarn server` to start rails server alone, which will now be running at <http://localhost:3000> by default
- `yarn start` to start both servers with a single command
- Alternatively you can start the servers using the webpack and rails command directly

  - `./bin/shakapacker-dev-server` to start webpack
    - This command might fail with `Command "webpack-dev-server" not found.`. In that case, you'll need to reinstall webpacker with `bundle exec rails:shakapacker:install`. During the install it will ask if you want to overwrite a few config files, do not overwrite them.
- In another terminal tab, run `rails s` to start the rails server

## How to migrate a page from AngularJS to React

See [docs/migrating-to-react](docs/migrating-to-react.md) for a step-by-step guide.

## Running Tests

To run ruby tests:

- `rake spec`
  - you may need to install [imagemagick](https://formulae.brew.sh/formula/imagemagick) due to a dependency on the [minimagick gem](https://github.com/minimagick/minimagick)

To run Angular unit tests:

- `rake jasmine:ci` to run in terminal
- `rake jasmine` to then run tests interactively at <http://localhost:8888/>

To run React unit tests:

- to run the entire suite run `yarn test`
- to run a single file run `jest path/to/folder/<name-of-file>.test.ts`

To run Legacy E2E (Angular) tests:

- Installation (needs to be run once): `./node_modules/protractor/bin/webdriver-manager update --versions.chrome 2.41 --versions.standalone 3.141.59` to get the selenium webdriver installed
- On one tab have your Rails server running: `rails s`
- On another tab, run `yarn protractor` to run the selenium webdriver and protractor tests. A Chrome browser will pop up and you will see it step through each of the tests.
- If you get errors starting selenium, make sure you have [java](https://java.com/en/download/) installed

To run E2E (React) tests:

- In one terminal start the application by running `yarn start`
- In another terminal
  - To run the full suite of tests run `yarn test:e2e`
  - To run a specific file run `cypress run --spec 'path/to/folder/<name-of-file>.e2e.ts'`

Note: These tests will run on [CircleCi](https://app.circleci.com/pipelines/github/SFDigitalServices/sf-dahlia-web) as well for every review app and QA deploy.

Note: If you want to output logs to the terminal locally and in CircleCI, replace the `yarn test:e2e` command with `ELECTRON_ENABLE_LOGGING=true DEBUG=cypress:electron yarn test:e2e`

## Importing pattern library styles

We currently manually transfer the application's CSS from [our pattern library](https://github.com/SFDigitalServices/sf-dahlia-pattern-library) using Grunt.

If you do not already have grunt installed, run `brew install grunt` to install it before proceeding.

To update this app with the latest PL styles:

1. [Clone the PL repository in the same parent directory as this one.](https://github.com/SFDigitalServices/sf-dahlia-pattern-library)
1. Switch to the PL branch you want to import styles from, either main or a specific branch
1. Run `npm run-script build` in the pattern lib directory to compile the css
1. `cd` to your `sf-dahlia-web` folder
1. Run `grunt`
1. Commit the updates to toolkit.scss with a reference to the commit you're updating from on pattern-lib

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

## Releases

Follow the [Webapp release process](https://sfgovdt.jira.com/wiki/spaces/HOUS/pages/2775351453/Frontend+release+process) page on Confluence for the full release guide.

## Feature Flags

Feature flags are provided by our own instance of Unleash and you can add feature flags through that portal (view confluence for feature flag instructions and naming conventions).

To use a feature flag, use the `useFeatureFlag` hook. The hook asks for the flag name (whatever is in Unleash) and the default value. The default value will be used if there is no url override and if Unleash is experiencing an outage. Therefore, an example usage of useFeatureFlag would be `useFeatureFlag("flagName", false)`

On non-production environments, you can override the value of a feature flag by adding a search parameter to the URL. For example, ...&featureFlag[flagName]=true would override the value being provided by Unleash (or the default value) and force the feature flag to be true. This will only work in environments where the Unleash environment is set to development.

## Environment variable configurations

### DALP Advertising

- ADVERTISE_DALP -> If set to 'true', the Sales directory page will display info about applying to DALP in a "Help with downpayments" section. Otherwise it'll show the plain "Get help" section
- DALP_PROGRAM_INFO -> If provided, we will override the default DALP text of "The 2021 Downpayment Assistance Loan Program (DALP) will begin accepting applications on February 26, 2021." with whatever is in this env var.

### Rewrite feature flags

We have flags for each chunk of the rewrite we release. These will set those pages to default to the React version. We phase out those flags when the rewritten pages have been live for some time. This can be overridden with

- <PAGE_NAME>\_REACT='true'

### React env variables

- TOP_MESSAGE string, turn top message on
- TOP_MESSAGE_TYPE defaults to `alert`, other options: [`primary`, `success`]
- TOP_MESSAGE_INVERTED default to `false`, when set to `true` sets AlertBox prop to inverted

### Other

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

### Qlty

[Qlty](https://qlty.sh) was spun out of Code Climate to focus on code quality checks.
Qlty provides a cli to run checks locally.

- Install the CLI: `curl https://qlty.sh | sh`
- [CLI Quickstart](https://docs.qlty.sh/cli/quickstart)
- Qlty relies on the cov reports from Jest tests in order to calculate its code coverage numbers.
  The simplest way to see code coverage locally is to run `yarn test` and open the results file, `app/javascript/test-coverage/lcov-report/index.html` from a browser.
- Run `qlty smells` to scan for code duplication and complexity
- `qlty check` will run linters and plugins.
- qlty commands run on changed files by default. To run against all files, pass the -a or --all switch.

### Changing the Style Guide settings

Any changes to Rubocop, JSCS, etc. affect the entire team, so it should be a group decision before committing any changes. Please don't commit changes without discussing with the team first.

### VS Code Setup

1. Copy `.vscode-default` to `.vscode` like `cp -r .vscode-default .vscode`
   a. We don't commit vscode workspace settings directly to the repo, instead we have a shared settings starting point file. That way you can add workspace specific settings that don't affect your team members (for example [Peacock workspace color settings](https://www.peacockcode.dev/guide/#install))
1. Install recommended extensions (under [.vscode-default/extensions](.vscode-default/extensions)).
1. Double check your user settings aren't overriding the [workspace editor settings](.vscode-default/settings)

### Credits

### License

Copyright (C) 2015 City and County of San Francisco

DAHLIA is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with DAHLIA. If not, see [http://choosealicense.com/licenses/gpl-3.0/](http://choosealicense.com/licenses/gpl-3.0/)
