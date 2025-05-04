#!/usr/bin/env bash
set -o errexit
pip install -r requirements.txt
python backend/manage.py collectstatic --noinput
python backend/manage.py migrate
