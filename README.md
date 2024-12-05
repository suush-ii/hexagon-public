# Hexagon

Setup env using .env.example if you don't have arbiter set DISABLE_RENDER to true or you will get errors.

To setup dev environment easily I made a docker container for this.

```bash
docker compose -f compose_dev.yml build
docker-compose -f compose_dev.yml up
```

# Production

There is another container for production as well. You do also have to setup the hexagon-maintenance project and build it for caddy's error pages to work. :3

```bash
docker compose build
docker compose up -d
```
