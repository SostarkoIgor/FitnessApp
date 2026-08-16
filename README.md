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

> **Note:** `docker compose down` removes the container, and since the SQLite database isn't
> persisted (see above), the next `docker compose up` starts from an empty database and
> re-seeds demo data automatically. Seeding replays every activity through the rank-tracking
> logic one at a time, so the app can take **1-2 minutes** before it's reachable at
> http://localhost:8080 — the link may fail to load during that window, which is expected.
>
> If you don't want to wait through this every time, use `docker compose stop` /
> `docker compose start` instead of `down` / `up` — this keeps the container (and its DB)
> intact, so restarts are fast and skip re-seeding.


As this is a simple app, feature structure of files was not used.
Things like edit/delete activity and others are out of scope and were not implemented.