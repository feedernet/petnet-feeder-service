# FeederNet

<img alt="Discovered devices screenshot" src="images/brand_header.png"/>

## About

![python](https://img.shields.io/badge/python-3.8%20%7C%203.9-blue)
[![FastAPI](https://img.shields.io/github/pipenv/locked/dependency-version/feedernet/petnet-feeder-service/fastapi?color=009485)](https://github.com/tiangolo/fastapi)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![codecov](https://codecov.io/gh/feedernet/petnet-feeder-service/branch/master/graph/badge.svg?token=UEK2SQ7C09)](https://codecov.io/gh/feedernet/petnet-feeder-service)
[![License: MIT](https://img.shields.io/badge/license-MIT-blueviolet)](https://github.com/feedernet/petnet-feeder-service/blob/master/LICENSE)
![Docker Build](https://github.com/feedernet/petnet-feeder-service/workflows/Docker%20Build/badge.svg)
![Backend Testing/Linting](https://github.com/feedernet/petnet-feeder-service/workflows/Backend%20Testing/Linting/badge.svg)

Reverse-engineering the PetNet feeders. This project only works with V2 Feeders so far.

## Setup / Installation

Head over to the [Getting Started Wiki](https://github.com/petnet-independence-project/petnet-feeder-service/wiki/Getting-Started) for more information on spinning up your first FeederNet instance.


## Developing

You need to make sure the Python modules are available.

```
pip install pipenv
pipenv install
pip install --editable .
```

To run the daemon locally:

```
python -m feeder
```

If you are planning on soley developing for the backend, you can build a static version of the frontend and access the backend directly:

```
cd static
PUBLIC_URL=/{{build_path}} npm run build
```

Otherwise, in a different shell, run the Webpack development server:

```
npm start
```

## Database and Schema Migrations

This project uses SQLAlchemy and Alembic for managing database models and schema migrations.

If you change a database model and need to generate a migration, Alembic can do that for you automatically!

```shell script
DATABASE_PATH=./data.db alembic revision --autogenerate -m "Changing something about the models."
```

This will create a migration script in `feeder/database/alembic/versions`.

To apply these changes to your database, run:

```shell script
DATABASE_PATH=./data.db alembic upgrade head
```

# How can I help?

If you have tech and coding experience, you can help! Drop Ted an email (ted@timmons.me); introduce yourself and he'll send you a Slack invite.

**The Slack channel is _NOT_ for support requests.**

We are looking for active contributors. If you are having an issue setting up your instance or are running into what you think is a bug, please file an issue.
