import { type APIRequestContext, type Page } from "@playwright/test";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { type AppRouter } from "~/server/api/root";
import { z } from "zod";
import superjson from "superjson";
import { Cookie } from "cookiejar";
import { e2eBaseUrl, type E2EUser } from "./constants";
import cookie from "cookie";
import { type ImportSchema } from "~/server/lib/import/importSchema";

const nextAuthSessionTokenCookieName = "next-auth.session-token";

export class PanthoraPage {
  private cookies: Cookie[] | undefined = undefined;
  private readonly client = createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${e2eBaseUrl}/api/trpc`,
        headers: () => {
          if (!this.cookies) {
            return {};
          }
          return {
            cookie: this.cookies.map((c) => c.toValueString()).join("; "),
          };
        },
      }),
    ],
  });
  public teamId: string | null = null;
  constructor(
    private readonly apiContext: APIRequestContext,
    private readonly page: Page,
    private readonly e2eUser: E2EUser
  ) {}

  public async loadCookiesFromContext() {
    const hasSessionCookie = this.cookies?.some(
      (c) => c.name === nextAuthSessionTokenCookieName
    );
    if (hasSessionCookie) {
      return;
    }
    this.cookies = (await this.page.context().cookies())
      .filter((c) => c.name === nextAuthSessionTokenCookieName)
      .map(
        (c) =>
          new Cookie(
            cookie.serialize(c.name, c.value, {
              domain: c.domain,
              path: c.path,
              secure: c.secure,
              httpOnly: c.httpOnly,
            })
          )
      );
    console.log("Loaded cookies from context");
    await this.loadTeamIdFromApi();
  }

  async loadTeamIdFromApi() {
    const response = await this.client.team.list.query();
    const team = response?.find((t) => t.name === this.e2eUser.teamName);
    if (!team) {
      throw new Error("Team not found");
    }
    this.teamId = team.id;
    console.log("Loaded team ID from API", this.teamId);
  }

  public async enableDarkMode() {
    await this.page.evaluate(() => {
      localStorage.setItem("chakra-ui-color-mode", "dark");
    });
    await this.page.reload();
  }

  public async register() {
    await this.client.user.register.mutate({
      email: this.e2eUser.email,
      password: this.e2eUser.password,
    });
  }

  private async getCsrfToken() {
    const response = await this.apiContext.get("/api/auth/csrf");
    if (!response.ok()) {
      throw new Error("Failed to get CSRF token");
    }
    return z
      .object({
        csrfToken: z.string(),
      })
      .parse(await response.json()).csrfToken;
  }

  public async createTeam() {
    const response = await this.client.team.create.mutate({
      name: this.e2eUser.teamName,
    });
    this.teamId = response.id;
  }

  public async signIn() {
    await this.page.goto(e2eBaseUrl);
    const csrfToken = await this.getCsrfToken();
    const response = await this.apiContext.post("/api/auth/callback/password", {
      form: {
        email: this.e2eUser.email,
        password: this.e2eUser.password,
        csrfToken,
        json: "true",
        redirect: "false",
        callbackUrl: "/",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to sign in");
    }
    const cookieHeader = response.headers()["set-cookie"];
    if (!cookieHeader) {
      throw new Error("No cookies in response");
    }
    const cookies = cookieHeader.split("\n").map((c) => new Cookie(c));
    const sessionCookie = cookies.find(
      (c) => c.name === nextAuthSessionTokenCookieName
    );
    if (!sessionCookie) {
      throw new Error("No session cookie found");
    }

    this.cookies = cookies;

    await this.page.context().addCookies([
      {
        name: sessionCookie.name,
        value: sessionCookie.value,
        domain: new URL(e2eBaseUrl).hostname,
        path: "/",
        expires: new Date().getTime() / 1000 + 60 * 60 * 24 * 30,
        secure: sessionCookie.secure,
        httpOnly: false,
      },
    ]);

    console.log("Signed in as", this.e2eUser.email);
  }

  public async setupUserWithTeam() {
    console.log("Registering user", this.e2eUser.email);
    await this.register();
    await this.signIn();

    console.log("Creating team");
    await this.createTeam();
    if (!this.teamId) {
      throw new Error("Team ID not set");
    }

    if (this.e2eUser.seed) {
      await this.importSeed();
    }

    await this.page.reload();
    await this.page.waitForSelector("body");

    return {
      ...this.e2eUser,
      teamId: this.teamId,
    };
  }

  public async importSeed(seed: ImportSchema | undefined = this.e2eUser.seed) {
    if (!seed) {
      throw new Error("User has no seed assigned");
    }
    if (!this.teamId) {
      throw new Error("User has no team ID assigned");
    }

    await this.client.team.import.mutate({
      teamId: this.teamId,
      data: JSON.stringify(seed),
    });
    console.log(`Imported seed "${seed.name}" for user`, this.e2eUser.email);
  }
}
