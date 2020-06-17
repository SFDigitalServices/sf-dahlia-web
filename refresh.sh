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
echo "loaded SALESFORCE_PASSWORD=$SALESFORCE_PASSWORD"
echo "loaded SALESFORCE_SECURITY_TOKEN=$SALESFORCE_SECURITY_TOKEN"
echo "loaded SALESFORCE_CLIENT_SECRET=$SALESFORCE_CLIENT_SECRET"
echo "loaded SALESFORCE_CLIENT_ID=$SALESFORCE_CLIENT_ID"
echo "loaded SALESFORCE_INSTANCE_URL=$SALESFORCE_INSTANCE_URL"

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
    heroku config:set SALESFORCE_PASSWORD=$SALESFORCE_PASSWORD --app $app
    heroku config:set SALESFORCE_SECURITY_TOKEN=$SALESFORCE_SECURITY_TOKEN --app $app
    heroku config:set SALESFORCE_CLIENT_SECRET=$SALESFORCE_CLIENT_SECRET --app $app
    heroku config:set SALESFORCE_CLIENT_ID=$SALESFORCE_CLIENT_ID --app $app
    heroku config:set SALESFORCE_INSTANCE_URL=$SALESFORCE_INSTANCE_URL --app $app
    echo "echo 'User.destroy_all' | rails c  && exit" | heroku run bash --app $app
done

echo "Heroku update complete"

if [ $env == "full" ]; then
  echo "Starting CircleCI credential update"
  BASE_CIRCLECI_URL="https://circleci.com/api/v1.1/project/github/SFDigitalServices/sf-dahlia-web/envvar"

  # Delete existing env vars
  curl -X DELETE $BASE_CIRCLECI_URL/SALESFORCE_PASSWORD?circle-token=$circle_ci_token
  curl -X DELETE $BASE_CIRCLECI_URL/SALESFORCE_SECURITY_TOKEN?circle-token=$circle_ci_token
  curl -X DELETE $BASE_CIRCLECI_URL/SALESFORCE_CLIENT_SECRET?circle-token=$circle_ci_token
  curl -X DELETE $BASE_CIRCLECI_URL/SALESFORCE_CLIENT_ID?circle-token=$circle_ci_token
  curl -X DELETE $BASE_CIRCLECI_URL/SALESFORCE_INSTANCE_URL?circle-token=$circle_ci_token

  # Create new env vars
  curl -X POST --header "Content-Type: application/json" -d '{"name": "SALESFORCE_PASSWORD", "value": "$SALESFORCE_PASSWORD"}' $BASE_CIRCLECI_URL?circle-token=$circle_ci_token
  curl -X POST --header "Content-Type: application/json" -d '{"name": "SALESFORCE_SECURITY_TOKEN", "value": "$SALESFORCE_SECURITY_TOKEN"}' $BASE_CIRCLECI_URL?circle-token=$circle_ci_token
  curl -X POST --header "Content-Type: application/json" -d '{"name": "SALESFORCE_CLIENT_SECRET", "value": "$SALESFORCE_CLIENT_SECRET"}' $BASE_CIRCLECI_URL?circle-token=$circle_ci_token
  curl -X POST --header "Content-Type: application/json" -d '{"name": "SALESFORCE_CLIENT_ID", "value": "$SALESFORCE_CLIENT_ID"}' $BASE_CIRCLECI_URL?circle-token=$circle_ci_token
  curl -X POST --header "Content-Type: application/json" -d '{"name": "SALESFORCE_INSTANCE_URL", "value": "$SALESFORCE_INSTANCE_URL"}' $BASE_CIRCLECI_URL?circle-token=$circle_ci_token

  echo "Credentials updated for CircleCI"
fi
