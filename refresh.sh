#!/bin/bash

# This script helps make recovering from Salesforce Refreshes easier. It:
# 1. Updates Heroku env vars
# 2. Clears now-invalid user DBs on Heroku apps
# 3. Updates env vars for Semaphore

# To use this script:
#   1. Put the updated env vars in a file (.env generally)
#   2. Add names of apps to update under webapp_apps
#.  3. If you don't already have it installed, install the [Semaphore CLI](https://semaphoreci.com/docs/cli-overview.html) and login
#   3. Run the script, passing your path to env vars as an argument

# TODO: Pull in heroku apps from files or at least review app numbers command line arg

# Argument defaults
env_file=".env"
semaphore_secret="sf-dahlia-web-full"

while getopts ":f::s::h" opt; do
  case $opt in
    h )
      echo "Usage:"
      echo "    refresh.sh -h                           Display this help message."
      echo "    refresh.sh -f <environment file>        Specify an environment file to load from, defaults to .env."
      echo "    refresh.sh -s <semaphore secret name>   Specify a Semaphore secret name to update, defaults to sf-dahlia-web-full."
      exit 0
      ;;
    f )
      env_file=$OPTARG
      ;;
    s )
      semaphore_secret=$OPTARG
      ;;
    \? ) echo "Usage: cmd [-h] [-f]"
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

echo "Starting Heroku credential update for Webapp"
# Get these app names from running "heroku apps"
declare -a webapp_apps=(
  "dahlia-full"
  "dahlia-qa-translations"
  "dahlia-full-pr-1268"
  "dahlia-full-pr-1272"
)

for app in "${webapp_apps[@]}"
  do
    echo "Updating credentials for $app"
    heroku config:set SALESFORCE_PASSWORD=$SALESFORCE_PASSWORD --app $app
    heroku config:set SALESFORCE_SECURITY_TOKEN=$SALESFORCE_SECURITY_TOKEN --app $app
    heroku config:set SALESFORCE_CLIENT_SECRET=$SALESFORCE_CLIENT_SECRET --app $app
    heroku config:set SALESFORCE_CLIENT_ID=$SALESFORCE_CLIENT_ID --app $app
    heroku config:set SALESFORCE_INSTANCE_URL=$SALESFORCE_INSTANCE_URL --app $app
    echo "echo 'User.destroy_all' | rails c  && exit" | heroku run bash --app $app
done

echo "Heroku update complete"


echo "Starting Semaphore credential update for $semaphore_secret"

sem secrets:env-vars:remove exygy/$semaphore_secret  --name SALESFORCE_PASSWORD
sem secrets:env-vars:remove exygy/$semaphore_secret  --name SALESFORCE_SECURITY_TOKEN
sem secrets:env-vars:remove exygy/$semaphore_secret  --name SALESFORCE_CLIENT_SECRET
sem secrets:env-vars:remove exygy/$semaphore_secret  --name SALESFORCE_CLIENT_ID
sem secrets:env-vars:remove exygy/$semaphore_secret  --name SALESFORCE_INSTANCE_URL

sem secrets:env-vars:add exygy/$semaphore_secret  --name SALESFORCE_PASSWORD --content "$SALESFORCE_PASSWORD"
sem secrets:env-vars:add exygy/$semaphore_secret  --name SALESFORCE_SECURITY_TOKEN --content "$SALESFORCE_SECURITY_TOKEN"
sem secrets:env-vars:add exygy/$semaphore_secret  --name SALESFORCE_CLIENT_SECRET --content "$SALESFORCE_CLIENT_SECRET"
sem secrets:env-vars:add exygy/$semaphore_secret  --name SALESFORCE_CLIENT_ID --content "$SALESFORCE_CLIENT_ID"
sem secrets:env-vars:add exygy/$semaphore_secret  --name SALESFORCE_INSTANCE_URL --content "$SALESFORCE_INSTANCE_URL"

echo "Credentials updated for Semaphore"
