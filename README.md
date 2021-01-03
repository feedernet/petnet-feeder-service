# FeederNet

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
