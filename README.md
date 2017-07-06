# Dahlia

[![Code Climate](https://codeclimate.com/github/Exygy/sf-dahlia-web/badges/gpa.svg)](https://codeclimate.com/github/Exygy/sf-dahlia-web)
[![Test Coverage](https://codeclimate.com/github/Exygy/sf-dahlia-web/badges/coverage.svg)](https://codeclimate.com/github/Exygy/sf-dahlia-web/coverage)
[![Build Status](https://semaphoreci.com/api/v1/exygy/sf-dahlia-web-full/branches/master/badge.svg)](https://semaphoreci.com/exygy/sf-dahlia-web-full)

## Purpose

DAHLIA is the affordable housing portal for the City and County of San Francisco. It was created by the Mayor's Office of Housing and Community Development (MOHCD). This application streamlines the process of searching and applying for affordable housing, making it easier to rent, buy and stay in our City.

## Dependencies
Before you install DAHLIA, your system should have the following:

- [Ruby](https://www.ruby-lang.org/en/documentation/installation/) 2.2.3
- [Bundler](https://github.com/bundler/bundler) `gem install bundler -v 1.12.5`
- [Homebrew](http://brew.sh)
- [PostgreSQL](https://postgresapp.com/)
- [Node.js](https://nodejs.org/en/) 6.2.2
  - can use installer from [nodejs.org](https://nodejs.org/en/) or see: [installing NVM and node.js on MacOS](https://stackoverflow.com/a/28025834/260495)

## Getting started

1. Make sure your PostgreSQL server is running (e.g. using [Postgres.app](https://postgresapp.com/) listed above)
1. Open a terminal window
1. `git clone https://github.com/Exygy/sf-dahlia-web.git` to create the project directory
1. `cd sf-dahlia-web` to open the directory
1. `bundle install` to download all necessary gems
    - see [here](https://stackoverflow.com/a/19850273/260495) if you have issues installing `pg` gem with Postgres.app, you may need to use: `gem install pg -v 0.18.4 -- --with-pg-config=/Applications/Postgres.app/Contents/Versions/latest/bin/pg_config
`
1. `npm install` to install bower, grunt and other dependencies (which will also automatically `bower install` to load front-end JS libraries)
1. `overcommit --install` to install git hooks into the repo
1. `rake db:create && rake db:migrate` to create the dev database and migrate the DB tables
1. copy `.env.sample` into a file called `.env`, and copy correct Salesforce environment credentials (not shared publicly in this repo)
1. `rails s` to start the server, which will now be running at http://localhost:3000 by default

## Running Tests

Run:
- `rake spec`
- `rake jasmine:ci`

To run E2E tests:
- Installation (needs to be run once): `./node_modules/protractor/bin/webdriver-manager update` to get the selenium webdriver installed
- On one tab have your Rails server running: `rails s`
- On another tab, run `npm run protractor` to run the selenium webdriver and protractor tests. A Chrome browser will pop up and you will see it step through each of the tests.

Note: These tests will run on Semaphore (our CI) as well for every review app and QA deploy.

### Acceptance/Feature Apps

Temporary "acceptance" apps are created upon opening a pull request for a feature branch. After the pull request is closed, the acceptance app is automatically spun down. See [this Heroku article](https://devcenter.heroku.com/articles/github-integration-review-apps) for details.

## Contributing changes

Use the engineering workflow and coding style standards established below. :smiley:

### Engineering Workflow Overview

Dahlia's current engineering workflow has been fully documented and can be found [here](https://docs.google.com/a/exygy.com/presentation/d/1Y5yAVUcKMFoNobutOH_Sehm69ZCZoTZzJZewupR-5KI/edit?usp=sharing).

Dahlia's project backlog is in [Pivotal Tracker](https://www.pivotaltracker.com/n/projects/1405352).

### Code style and quality

#### Javascript

Javascript code quality is ensured by two npm packages: JsHint and JSCS. They will run automatically as a pre-commit hooks. Follow the [Airbnb JavaScript Style guide](http://nerds.airbnb.com/our-javascript-style-guide/).

#### Ruby
[Rubocop](https://github.com/bbatsov/rubocop) is configured in `.rubocop.yml` to enforce code quality and style standards based on the [Ruby Style Guide](https://github.com/bbatsov/ruby-style-guide) and runs every time you commit using a pre-commit hook. Refer to the [Ruby Style Guide](https://github.com/bbatsov/ruby-style-guide) for all Ruby style questions.
To identify and have Rubocop automatically correct violations when possible, run:

* `rubocop -a [path_to_file]` for individual files
* `rubocop -a` for all Ruby files

#### JavaScript File Structure

When adding new modules to the JavaScript dirctory, please follow the example structure below to mantain a modular component structure.

```
- javascripts
    - applications
        - ApplicationsController.js
        - ApplicationsService.js
        - templates
            - applications.html
    - listings
        - ListingController.js
        - ListingService.js
        - templates
            - listings.html
            - listing.html
    - shared
        - SharedService.js
        - SharedController.js
        - LanguageController.js
        - LanguageService.js
        - directives
        - filters
        - templates
            - welcome.html
```

### Changing the Style Guide settings
Any changes to Rubocop, JSCS, etc. affect the entire team, so it should be a group decision before commiting any changes. Please don't commit changes without discussing with the team first.

### Credits


### License
Copyright (C) 2015 City and County of San Francisco

DAHLIA is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with DAHLIA. If not, see [http://choosealicense.com/licenses/gpl-2.0/](http://choosealicense.com/licenses/gpl-2.0/)
