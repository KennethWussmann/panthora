import { type APIRequestContext, type Page } from "@playwright/test";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { type AppRouter } from "~/server/api/root";
import { faker } from "@faker-js/faker";
import { z } from "zod";
import superjson from "superjson";
import { Cookie } from "cookiejar";
import { e2eBaseUrl } from "./constants";

export class PanthoraPage {
  private readonly e2eTestUser = {
    email:
      `${faker.person.firstName()}.${faker.person.lastName()}@panthora.io`.toLowerCase(),
    password: "e2eTestPassword!",
    teamName: "E2E Test",
  };
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
  private teamId: string | null = null;
  constructor(
    private readonly apiContext: APIRequestContext,
    private readonly page: Page
  ) {}

  public async enableDarkMode() {
    await this.page.evaluate(() => {
      localStorage.setItem("chakra-ui-color-mode", "dark");
    });
    await this.page.reload();
  }

  public async register() {
    await this.client.user.register.mutate({
      email: this.e2eTestUser.email,
      password: this.e2eTestUser.password,
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
      name: this.e2eTestUser.teamName,
    });
    this.teamId = response.id;
  }

  public async signIn() {
    await this.page.goto(e2eBaseUrl);
    const csrfToken = await this.getCsrfToken();
    const response = await this.apiContext.post("/api/auth/callback/password", {
      form: {
        email: this.e2eTestUser.email,
        password: this.e2eTestUser.password,
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
      (c) => c.name === "next-auth.session-token"
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

    console.log("Signed in as", this.e2eTestUser.email);
  }

  public async setupUserWithTeam() {
    console.log("Registering user", this.e2eTestUser.email);
    await this.register();
    await this.signIn();

    console.log("Creating team");
    await this.createTeam();
    if (!this.teamId) {
      throw new Error("Team ID not set");
    }

    await this.page.reload();
    await this.page.waitForSelector("body");

    return {
      ...this.e2eTestUser,
      teamId: this.teamId,
    };
  }
}
