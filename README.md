Set .env file:

``` 
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=nestjs
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin
DATABASE_URL="postgresql://admin:admin@postgres:5432/nestjs"
SESSION_SECRET=
```

```
$ docker-compose up --build

$ docker exec -it nestjs_app /bin/sh

$ npx prisma migrate deploy
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```