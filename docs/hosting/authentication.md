# Authentication

## Password Auth

> [!WARNING]  
> Using password auth is highly discouraged! Use [SSO](./authentication.md#sso) instead.

Password auth is a simple authentication method using email address and password. It is disabled by default. To enable it set the respective environment variable:

```shell
PASSWORD_AUTH_ENABLED=true
```

It is intended for any local deployments of Panthora that are not internet facing or for emergency access if the configured SSO provider is offline

Because Panthora cannot send emails in the current state, email addresses are not verified. Users can just register new accounts with any email address they like.

The password authentication mechanism is protected by rate-limiting to avoid enumeration, brute-force attacks and spam. Read more about rate-limiting in the corresponding [guide](./rate-limit.md).

Panthora also does not support any kind of multi-factor authentication on purpose. If you would like to have something like this use SSO instead with a provider that supports this feature.

Currently, it's not possible to reset a forgotten password.

## SSO

Single Sign-On is the best option for securely hosting Panthora. There are many supported providers out of the box, but also any custom OAuth2/OIDC provider is supported using the `Generic OAuth` environment variables.

To configure the desired provider, refer to the [configuration guide](./configuration.md#authentication).

## Account Linking

When Password Auth was used to register a new account with a certain email address, using SSO with the same email address is no longer possible. For security reasons these accounts will not be linked and the registration will fail.

When the account has been registered through a SSO provider, the corresponding email account cannot be registered via password auth. 

An account that has been registered through SSO, can have a password. This can be done by the user in their settings when password auth is enabled in combination with SSO. This allows the user to then sign in either via SSO or via password. This can be helpful for scenarios where the SSO provider is offline. 