# Dahlia #

[![Test Coverage](https://codeclimate.com/repos/560d76bb6956807c3a0028cb/badges/0d072238f8dc74804ac9/coverage.svg)](https://codeclimate.com/repos/560d76bb6956807c3a0028cb/coverage)

[![Build Status](https://semaphoreci.com/api/v1/projects/53186731-1e6c-43a4-9d43-860e0759ea9a/558206/badge.svg)](https://semaphoreci.com/exygy/sf-dahlia-web)

## Purpose ##

DAHLIA is the affordable housing portal for the City and County of San Francisco. It was created by the Mayor's Office of Housing and Community Development (MOHCD). This application streamlines the process of searching and applying for affordable housing, making it easier to rent, buy and stay in our City.

## Dependencies ##
Before you install DAHLIA, your system should have the following:

- [Ruby](https://www.ruby-lang.org/en/documentation/installation/) (see Gemfile for version)
- [Homebrew](http://brew.sh)
- bundler `gem install bundler`
- [PostgreSQL](http://exponential.io/blog/2015/02/21/install-postgresql-on-mac-os-x-via-brew/)
- `brew install node`
- npm install -g grunt-cli (To run grunt commands globally)
- npm install bower

### Getting started ###
We will create a Boxen for this project, but for now to get started:

## How to Install ##
1. Clone the repo `git clone https://github.com/Exygy/sf-dahlia-web.git`
2. Open a terminal window
3. Run `bundle install` in command line to download all necessary gems
3. Run `npm install` to run the js style and code linters
4. Run `overcommit --install` to install git hooks into the repo
5. Run `bower install`
6. Run `grunt`. Ensure that the *latest* pattern library is in the same folder as this repo.
Running grunt will migrate the css over from the pattern library. You can ignore the warning that says `Unable to match 1 pattern.`.
7. Run `rake bower:install`
8. Open a separate terminal tab and run `postgres -D /usr/local/var/postgres` to start Postgres.
9. Run `rake db:create`, followed by `rake db:migrate` to create the app database.
10. If you have access to the correct environment values, create a file named `.env` and copy in the values. It will look similar to `.env.sample`.
11. Run `rails s` to start the server.

## Running Tests ##

Run:
- `rake spec`
- `rake jasmine:ci`

To run E2E tests:
- On a tab run `rails s`
- On another tab, run `webdriver-manager start`
- On a final tab, run `protractor spec/e2e/conf.js`

### Acceptance/Feature Apps ###

Temporary "acceptance" apps are created upon opening a pull request for a feature branch. After the pull request is closed, the acceptance app is automatically spun down. See [this Heroku article](https://devcenter.heroku.com/articles/github-integration-review-apps) for details.

## Contributing changes ##

<3 Use the engineering workflow and coding style standards established below. <3

### Engineering Workflow Overview ###

Dahlia's current engineering workflow has been fully documented and can be found [here](https://docs.google.com/a/exygy.com/presentation/d/1Y5yAVUcKMFoNobutOH_Sehm69ZCZoTZzJZewupR-5KI/edit?usp=sharing).

Dahlia's project backlog is in [Pivotal Tracker](https://www.pivotaltracker.com/n/projects/1405352).

### Code style and quality ###

#### Javascript ####

Javascript code quality is ensured by two npm packages: JsHint and JSCS. They will run automatically as a pre-commit hooks. Follow the [Airbnb JavaScript Style guide](http://nerds.airbnb.com/our-javascript-style-guide/).

#### Ruby ####
[Rubocop](https://github.com/bbatsov/rubocop) is configured in `.rubocop.yml` to enforce code quality and style standards based on the [Ruby Style Guide](https://github.com/bbatsov/ruby-style-guide) and runs every time you commit using a pre-commit hook. Refer to the [Ruby Style Guide](https://github.com/bbatsov/ruby-style-guide) for all Ruby style questions.
To identify and have Rubocop automatically correct violations when possible, run:

* `rubocop -a [path_to_file]` for individual files
* `rubocop -a` for all Ruby files

#### JavaScript File Structure ####

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

### Credits ###


### License ###
Copyright (C) 2015 City and County of San Francisco

DAHLIA is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with DAHLIA. If not, see [http://choosealicense.com/licenses/gpl-2.0/](http://choosealicense.com/licenses/gpl-2.0/)
