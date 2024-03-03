# Hosting

> [!WARNING]  
> Panthora is still in a pre-release phase and **not production-ready**.

Hosting Panthora is best done via Docker. There are Docker images for `amd64` and `arm64`.

**Image:** `ghcr.io/kennethwussmann/panthora`

**Tags:**

- `latest` - The latest stable release
- `x.x.x` - Specific version (see [Releases](https://github.com/KennethWussmann/panthora/releases))
- `develop` - Latest up-to-date development build with features still in progress (unstable)

## Dependencies

Panthora needs the following third-party services to work:

- Postgres v15.x
- MeiliSearch v1.x

They can be hosted anywhere, but best would be to set them up with Docker Compose.

## Docker Compose

Once deployed Panthora is available at `http://localhost:3000`. For configuration of Panthora refer to the [Configuration docs](./configuration.md).

```YAML
version: "3.9"
services:
  database:
    image: postgres:15
    restart: always
    volumes:
      - database:/var/lib/postgresql/data
    networks:
      - panthora
    environment:
      POSTGRES_PASSWORD: panthora
      POSTGRES_USER: panthora
      POSTGRES_DB: panthora
  search:
    image: getmeili/meilisearch:v1.6.2
    restart: always
    volumes:
      - search:/meili_data
    networks:
      - panthora
    environment:
      MEILI_ENV: production
      MEILI_NO_ANALYTICS: true
      MEILI_MASTER_KEY: <fill-me>
  panthora:
    image: ghcr.io/kennethwussmann/panthora:latest
    restart: always
    depends_on:
      - database
      - search
    networks:
      - panthora
    ports:
      - 3000:3000
    environment:
      DATABASE_URL: postgresql://panthora:panthora@database:5432/panthora
      NEXTAUTH_SECRET: <fill-me>
      NEXTAUTH_URL_INTERNAL: http://panthora:3000
      NEXTAUTH_URL: https://example.com
      APP_BASE_URL: https://example.com
      MEILI_URL: http://search:7700
      MEILI_MASTER_KEY: <fill-me>
      PASSWORD_AUTH_ENABLED: true

networks:
  panthora:
volumes:
  database:
  search:
```

## Further reading

1. [Authentication Guide](./authentication.md)
2. [Configuration Guide](./configuration.md)
