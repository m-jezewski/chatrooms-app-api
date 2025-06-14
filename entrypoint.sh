#!/bin/sh

echo "Waiting for db..."
until nc -z -v -w30 postgres 5432
do
  echo "Waiting for postgres..."
  sleep 1
done

echo "DB available. Running migrations and adding default data"

npx prisma migrate deploy
npx prisma db seed

echo "Starting dev"
nodemon -L
