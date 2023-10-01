# Hexagon

Using bun in production and node for development.

Setup env using .env.example

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```
bun i
```

```bash
bun run build
```

## Production Setup

This project uses postgres for the database, drizzle for the orm, and lucia for authentication/session handling.

In production setup a NGINX server as a reverse proxy on port 9000. Example config below.

```nginx
location / {

    proxy_pass http://127.0.0.1:9000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Forwarded-Proto $scheme; # these are important so the sveltekit server can verify the origin
    proxy_set_header X-Forwarded-Host $host;

}
```

```bash
bun run prod
```

You can preview the production build with `npm run preview`.
