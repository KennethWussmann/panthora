# Configuration

Configuration is done via Environment Variables on the Docker Container. Here you can find a list of all available settings.

## General

<table>
  <tr>
    <th>Variable</th>
    <th>Default</th>
    <th>Example</th>
    <th>Required</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>DATABASE_URL</code></td>
    <td></td>
    <td><code>postgresql://username:password@localhost:5432/tory</code></td>
    <td>Yes</td>
    <td>Credentials and location of the database server.</td>
  </tr>
  <tr>
    <td><code>NEXTAUTH_SECRET</code></td>
    <td></td>
    <td></td>
    <td>Yes</td>
    <td>Used to encrypt JWTs. Use <code>openssl rand -base64 32</code> to generate one.</td>
  </tr>
  <tr>
    <td><code>NEXTAUTH_URL</code></td>
    <td></td>
    <td><code>https://my-tory.com</code></td>
    <td>Yes</td>
    <td>Public URL where your Tory instance is reachable.</td>
  </tr>
  <tr>
    <td><code>APP_BASE_URL</code></td>
    <td></td>
    <td><code>https://my-tory.com</code></td>
    <td>Yes</td>
    <td>Public URL where your Tory instance is reachable. Same as <code>NEXTAUTH_URL</code>.</td>
  </tr>
  <tr>
    <td><code>NEXTAUTH_URL_INTERNAL</code></td>
    <td></td>
    <td><code>http://tory:3000</code></td>
    <td>Yes, if running behind reverse-proxy</td>
    <td>Internal URL where your Tory instance is reachable when running behind a reverse-proxy. <code>tory</code> refers to the Docker Compose service name</td>
  </tr>
  <tr>
    <td><code>MEILI_URL</code></td>
    <td></td>
    <td><code>http://search:7700</code></td>
    <td>Yes</td>
    <td>URL where your MeiliSearch instance is reachable. <code>search</code> refers to the Docker Compose service name</td>
  </tr>
  <tr>
    <td><code>MEILI_MASTER_KEY</code></td>
    <td></td>
    <td></td>
    <td>Yes</td>
    <td>Master key that is also configured for the MeiliSearch instance.</td>
  </tr>
</table>

## Authentication

<table>
  <tr>
    <th>Variable</th>
    <th>Default</th>
    <th>Example</th>
    <th>Required</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>PASSWORD_AUTH_ENABLED</code></td>
    <td><code>false</code></td>
    <td><code>true</code></td>
    <td>No</td>
    <td>Allow users to register and login with password credentials.</td>
  </tr>
  <tr>
    <td><code>COGNITO_CLIENT_ID</code></td>
    <td></td>
    <td></td>
    <td>Yes, if you want to enable AWS Cognito auth</td>
    <td>AWS Cognito Client ID</td>
  </tr>
  <tr>
    <td><code>COGNITO_CLIENT_SECRET</code></td>
    <td></td>
    <td></td>
    <td>Yes, if you want to enable AWS Cognito auth</td>
    <td>AWS Cognito Client Secret</td>
  </tr>
  <tr>
    <td><code>COGNITO_ISSUER</code></td>
    <td></td>
    <td><code>https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_xxxxxxx</code></td>
    <td>Yes, if you want to enable AWS Cognito auth</td>
    <td>AWS Cognito Issuer URL</td>
  </tr>
  <tr>
    <td><code>DISCORD_CLIENT_ID</code></td>
    <td></td>
    <td></td>
    <td>Yes, if you want to enable Discord auth</td>
    <td>Discord Client ID</td>
  </tr>
  <tr>
    <td><code>DISCORD_CLIENT_SECRET</code></td>
    <td></td>
    <td></td>
    <td>Yes, if you want to enable Discord auth</td>
    <td>Discord Client Secret</td>
  </tr>
  <tr>
    <td><code>GITHUB_CLIENT_ID</code></td>
    <td></td>
    <td></td>
    <td>Yes, if you want to enable GitHub auth</td>
    <td>GitHub Client ID</td>
  </tr>
  <tr>
    <td><code>GITHUB_CLIENT_SECRET</code></td>
    <td></td>
    <td></td>
    <td>Yes, if you want to enable GitHub auth</td>
    <td>GitHub Client Secret</td>
  </tr>
  <tr>
    <td><code>GOOGLE_CLIENT_ID</code></td>
    <td></td>
    <td></td>
    <td>Yes, if you want to enable Google auth</td>
    <td>Google Client Id</td>
  </tr>
  <tr>
    <td><code>GOOGLE_CLIENT_SECRET</code></td>
    <td></td>
    <td></td>
    <td>Yes, if you want to enable Google auth</td>
    <td>Google Client Secret</td>
  </tr>
</table>

## Misc

<table>
  <tr>
    <th>Variable</th>
    <th>Default</th>
    <th>Example</th>
    <th>Required</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>DISABLE_RATE_LIMIT</code></td>
    <td><code>false</code></td>
    <td><code>true</code></td>
    <td>No</td>
    <td>Disable <a href="./rate-limit.md">Rate-Limiting</a>. Use with caution!</td>
  </tr>
  <tr>
    <td><code>LOG_LEVEL</code></td>
    <td><code>info</code></td>
    <td><code>debug</code></td>
    <td>No</td>
    <td>Enable debug logs, helpful for debugging problems.</td>
  </tr>
</table>
