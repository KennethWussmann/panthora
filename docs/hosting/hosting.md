# Hosting

> [!WARNING]  
> Tory is still in a pre-release phase and **not production-ready**.

Hosting Tory is best done via Docker. There are Docker images for `amd64` and `arm64`.

**Image:** `ghcr.io/kennethwussmann/tory`

**Tags:**

- `latest` - The latest stable release
- `x.x.x` - Specific version (see [Releases](https://github.com/KennethWussmann/tory/releases))
- `develop` - Latest up-to-date development build with features still in progress (unstable)

## Dependencies

Tory needs the following third-party services to work:

- Postgres v15.x
- MeiliSearch v1.x

You can host them anywhere, but best would be to set them up with Docker Compose.

## Docker Compose

Once deployed you can reach tory at `http://localhost:3000`.

```YAML
version: "3.9"
services:
  database:
    image: postgres:15
    restart: always
    volumes:
      - database:/var/lib/postgresql/data
    networks:
      - tory
    environment:
      POSTGRES_PASSWORD: tory
      POSTGRES_USER: tory
      POSTGRES_DB: tory
  search:
    image: getmeili/meilisearch:v1.6.2
    restart: always
    volumes:
      - search:/meili_data
    networks:
      - tory
    environment:
      MEILI_ENV: production
      MEILI_NO_ANALYTICS: true
      MEILI_MASTER_KEY: <fill-me>
  tory:
    image: ghcr.io/kennethwussmann/tory:latest
    restart: always
    depends_on:
      - database
      - search
    networks:
      - tory
    ports:
      - 3000:3000
    environment:
      DATABASE_URL: postgresql://tory:tory@database:5432/tory
      NEXTAUTH_SECRET: <fill-me>
      NEXTAUTH_URL_INTERNAL: http://tory:3000
      NEXTAUTH_URL: https://example.com
      APP_BASE_URL: https://example.com
      MEILI_URL: http://search:7700
      MEILI_MASTER_KEY: <fill-me>
      PASSWORD_AUTH_ENABLED: true

networks:
  tory:
volumes:
  database:
  search:
```
