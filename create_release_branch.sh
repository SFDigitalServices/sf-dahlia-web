#!/bin/bash

# This creates a new release branch off of main

skip_branch_creation='false'

while getopts ":h" opt; do
  case $opt in
    h )
      echo "Usage:"
      echo "    refresh.sh -h                           Display this help message."
      exit 0
      ;;
    \? ) echo "Usage: cmd [-h]"
      ;;
  esac
done

# Ensure working directory in version branch clean
git update-index -q --refresh
if ! git diff-index --quiet HEAD --; then
  echo "Working directory not clean, please commit your changes first"
  exit
fi

formatted_date=$(date +'%m-%d-%Y')
branch_name="release-$formatted_date"

echo "Checking out and updating to the latest main"
git checkout main && git pull --rebase origin main

echo "Checking out new branch off main: $branch_name"
git checkout -b $branch_name

echo "Pushing branch to Github and opening in browser."
git push origin -u $branch_name
open "https://github.com/SFDigitalServices/sf-dahlia-web/tree/$branch_name";
