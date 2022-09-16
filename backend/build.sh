#!/bin/bash

# exit on errors
set -euv

# delete old virtual environment if it exists
rm -rf .env || true

# create new virtual env
python3 -m venv .env

# activate virtual environment
set +v
source .env/bin/activate
set -v

# install project's python dependencies
pip install -r ./requirements.txt  --no-cache-dir

# check for .env file and use the template if it's not there
cd blockso
[ -f ".env" ] || cp ./sample-dev-env ./.env

# run tests
python manage.py test

# run migrations
python manage.py migrate

# run server
python manage.py runserver
