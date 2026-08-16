# FitnessApp

## Running with Docker Compose

The app (Angular client + ASP.NET Core server) builds and runs as a single container.

Prerequisites: [Docker](https://www.docker.com/) with Compose.

From the repository root:

```bash
docker compose up --build
```

Once it's up, open http://localhost:8080.

- API docs (Swagger): http://localhost:8080/swagger ->by using /api/Users/leaderboard you can access user id of other users to be able to test app better (thats why ids are available in that endpoint)
- Demo data is seeded automatically on first run (empty database only), controlled by the `SEED_DEMO_DATA` environment variable in `docker-compose.yml`.
- The SQLite database lives inside the container and is not persisted across `docker compose down` — add a volume in `docker-compose.yml` if you need data to survive restarts.

To stop the app:

```bash
docker compose down
```


As this is a simple app, feature structure of files was not used.
Things like edit/delete activity and others are out of scope and were not implemented.