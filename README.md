# core-api

## Development

Launch docker services and create the test database:

```bash
docker-compose up -d
docker exec -u postgres core-api_database_1 createdb test
```

Install the required dependencies:

```bash
yarn
```

And you may now run the tests with:

```bash
yarn test
```

Or the api with:

```bash
DEBUG=* yarn api
```

If you wish to create a new migration:

```bash
knex migrate:make migration_name
```

## Commands

### database-reset-command

Use this command to reset the database and run all migrations in non production environments.

```bash
bin/commands/database-reset-command.js
```

### populate-command

Use this command to populate the database with dummy data.

```bash
bin/commands/populate-command.js
```

## Releases

Be sure to have configured `GITHUB_TOKEN` in your globals.

```bash
npm version [<new version> | major | minor | patch] -m "Release %s"
git push origin master && git push --tags
```
