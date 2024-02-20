# Updating Tory

Updating tory is a straight-forward process for the most part, but check the notes about MeiliSearch and Postgres as well.

## Tory

Tory follows [Semantic Versioning (SemVer)](https://semver.org/) principles with a slight modification during the pre-release phase (version 0.x.y).

- **Major versions (0.x.0)**: During the version 0 stage, an increment in the minor version number (the 'x' in 0.x.0) may introduce backward-incompatible changes. This is akin to a major version bump in standard SemVer practices. These updates are used to signal significant changes, improvements, or reworks that may require adjustments in how you use Tory.

- **Minor versions (0.x.y):** Patch updates (the 'y' in 0.x.y) focus on backward-compatible bug fixes and minor enhancements that do not require major changes or data-loss on your end. These updates aim to improve the stability and performance without introducing breaking changes.

This versioning approach allows me to iterate rapidly and incorporate feedback while signaling to users the potential impact of each release. Tory will transition to standard SemVer practices (1.x.y) once the project reaches a stable and mature phase, at which point version numbers will strictly adhere to major, minor, and patch updates as defined by SemVer.

You can update the Docker version tag in your Docker Compose file or re-pull `latest`/`develop` to update Tory. Notice that `latest` and `develop` may introduce breaking changes because they update automatically to the latest major release.

## MeiliSearch

Updating MeiliSearch is not as simple as updating the Docker image tag. If you only update the tag version, MeiliSearch will refuse to start. You have to do a proper migration. Please see their [migration guide](https://www.meilisearch.com/docs/learn/update_and_migration/updating#updating-a-local-or-deployed-meilisearch-instance) for help.

Also please check the [mentioned dependency versions](./hosting.md#dependencies) and don't update above that.

## Postgres

Updating Postgres to the latest minor version is recommended. Minor version updates should always be possible without problems. See the [versioning policy of Postgres](https://www.postgresql.org/support/versioning/) for more details.

Also please check the [mentioned dependency versions](./hosting.md#dependencies) and don't update above that.
