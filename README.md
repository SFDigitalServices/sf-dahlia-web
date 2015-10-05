# Dahlia #

[![Code Climate](https://codeclimate.com/repos/560d76bb6956807c3a0028cb/badges/0d072238f8dc74804ac9/gpa.svg)](https://codeclimate.com/repos/560d76bb6956807c3a0028cb/feed)

[![Test Coverage](https://codeclimate.com/repos/560d76bb6956807c3a0028cb/badges/0d072238f8dc74804ac9/coverage.svg)](https://codeclimate.com/repos/560d76bb6956807c3a0028cb/coverage)

[![Build Status](https://semaphoreci.com/api/v1/projects/53186731-1e6c-43a4-9d43-860e0759ea9a/558206/badge.svg)](https://semaphoreci.com/exygy/sf-dahlia-web)

## Purpose ##

DAHLIA is the affordable housing portal for the City and County of San Francisco. It was created for the Mayor's Office of Housing and Community Development (MOHCD). This application streamlines the process of searching and applying for affordable housing, making it easier to rent, buy and stay in our City.

## Dependencies ##
Before you install DAHLIA, your system should have the following:
1. [Ruby](https://www.ruby-lang.org/en/documentation/installation/) (see Gemfile for version)
2. [Homebrew](http://brew.sh)
4. bundler `gem install bundler`
5. [PostgreSQL](http://exponential.io/blog/2015/02/21/install-postgresql-on-mac-os-x-via-brew/)
6. npm `brew install node`

### Getting started ###
We will create a Boxen for this project, but for now to get started:

## How to Install ##
1. Clone the repo `git clone https://github.com/Exygy/sf-dahlia-web.git`
2. Open a terminal window
3. Run `bundle install` in command line to download all necessary gems
3. Run `npm install` to run the js style and code linters

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

### Changing the Style Guide settings
Any changes to Rubocop, JSCS, etc. affect the entire team, so it should be a group decision before commiting any changes. Please don't commit changes without discussing with the team first.

### Credits ###


### License ###
Copyright (C) 2015 City and County of San Francisco

DAHLIA is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with DAHLIA. If not, see [http://choosealicense.com/licenses/gpl-2.0/](http://choosealicense.com/licenses/gpl-2.0/)