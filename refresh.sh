#!/bin/bash

# This script helps make recovering from Salesforce Refreshes easier. It:
# 1. Updates Heroku env vars
# 2. Clears now-invalid user DBs on Heroku apps
# 3. Updates env vars for Semaphore

# To use this script:
#   1. Put the updated env vars in a file (.env generally)
#   2. If you don't already have it installed, run `brew install jq` to install the jq tool
#   3. Get a circleCI token by going to https://app.circleci.com/settings/user/tokens and adding a personal API token.
#   3. Run the script, passing your path to env vars as an argument

# TODO: add a qa flag to allow updates for QA.

# Argument defaults
env_file=".env"

VARS_TO_UPDATE_CIRCLE_CI=(
  "SALESFORCE_HOST"
  "SALESFORCE_PASSWORD"
  "SALESFORCE_SECURITY_TOKEN"
  "SALESFORCE_CLIENT_SECRET"
  "SALESFORCE_CLIENT_ID"
  "SALESFORCE_INSTANCE_URL"
)

VARS_TO_UPDATE_HEROKU=(
  "SALESFORCE_PASSWORD"
  "SALESFORCE_SECURITY_TOKEN"
  "SALESFORCE_CLIENT_SECRET"
  "SALESFORCE_CLIENT_ID"
  "SALESFORCE_INSTANCE_URL"
)

while getopts ":h::e::c:" opt; do
  case $opt in
    h )
      echo "Usage:"
      echo "    refresh.sh -h                           Display this help message."
      echo "    refresh.sh -e <environment>             Specify an environment to update, either full or qa."
      echo "    refresh.sh -c <circle ci token>         Provide a CircleCI token."
      exit 0
      ;;
    e )
      env=$OPTARG
      ;;
    c )
      circle_ci_token=$OPTARG
      ;;
    \? ) echo "Usage: cmd [-h] [-e] [-c]"
      ;;
  esac
done
echo "Loading environment variables from file: $env_file"
source $env_file

for varname in ${VARS_TO_UPDATE_CIRCLE_CI[@]}; do
  value="${!varname}"
  echo "loaded $varname=$value"
done

echo "Starting Heroku credential update for Webapp $env"

if [ $env == "full" ]; then
  # Get all apps that are dahlia-web-full apps.
  heroku_apps=$(heroku apps --team=sfdigitalservices --json | jq '.[].name | select(test("dahlia-web-full-*"))')
  heroku_apps=("dahlia-full" ${heroku_apps[@]})
elif [ $env == "qa" ]; then
  heroku_apps=('dahlia-qa')
else
  echo "Error: environment must be full or qa"
  exit 1
fi


for app in ${heroku_apps[@]}
  do
    # Strip out double quotes from app names
    app=$(echo "$app" | tr -d '"')
    echo "Updating credentials for $app"
    for varname in ${VARS_TO_UPDATE_HEROKU[@]}; do
      value="${!varname}"
      heroku config:set $varname=$value --app $app
    done
    echo "echo 'User.destroy_all' | rails c  && exit" | heroku run bash --app $app
done

echo "Heroku update complete"

if [ $env == "full" ]; then
  echo "Starting CircleCI credential update"
  BASE_CIRCLECI_URL="https://circleci.com/api/v1.1/project/github/SFDigitalServices/sf-dahlia-web/envvar"

  for varname in ${VARS_TO_UPDATE_CIRCLE_CI[@]}; do
    value="${!varname}"
    # Delete existing env var
    curl -s -X DELETE $BASE_CIRCLECI_URL/$varname?circle-token=$circle_ci_token
    # Create new env var
    curl -X POST --header "Content-Type: application/json" -d "{\"name\": \"$varname\", \"value\": \"$value\"}" $BASE_CIRCLECI_URL?circle-token=$circle_ci_token
  done

  echo "Credentials updated for CircleCI"
fi
