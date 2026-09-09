import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createServer } from "node:http";
import type { Fault, Session } from "./data.js";
import { cents, fields, memberQuery, members, reauthForm, transferForm } from "./data.js";
import * as page from "./pages.js";

export type { Fault } from "./data.js";
export type SandboxOptions = {
  readonly port?: number;
  readonly fault?: Fault;
  readonly delayMs?: number;
};
export type Sandbox = {
  readonly origin: string;
  readonly close: () => Promise<void>;
  readonly stats: { commits: number; reviewRequests: number; searchRequests: number };
  readonly setFault: (fault: Fault) => void;
};

async function readForm(request: IncomingMessage): Promise<URLSearchParams | undefined> {
  if (request.headers["content-type"]?.split(";")[0] !== "application/x-www-form-urlencoded")
    return undefined;
  const chunks: Buffer[] = [];
  let length = 0;
  for await (const chunk of request) {
    if (!(chunk instanceof Buffer)) return undefined;
    length += chunk.byteLength;
    if (length > 4096) return undefined;
    chunks.push(chunk);
  }
  return new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
}

export async function startSandbox(options: SandboxOptions = {}): Promise<Sandbox> {
  let fault = options.fault ?? "none";
  const delayMs = options.delayMs ?? 500;
  const sessions = new Map<string, Session>();
  const stats = { commits: 0, reviewRequests: 0, searchRequests: 0 };

  async function handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; frame-ancestors 'self'; form-action 'self'; base-uri 'none'",
    );
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const cookie = request.headers.cookie
      ?.split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith("sandbox-session="));
    const priorId = cookie?.slice("sandbox-session=".length);
    let session = priorId === undefined ? undefined : sessions.get(priorId);
    if (session === undefined) {
      const id = randomUUID();
      session = {
        member: undefined,
        expired: false,
        expiryUsed: false,
        review: undefined,
        readyAt: 0,
      };
      sessions.set(id, session);
      response.setHeader("Set-Cookie", `sandbox-session=${id}; HttpOnly; SameSite=Strict; Path=/`);
    }
    const send = (body: string): void => {
      response.end(body);
    };
    const reject = (heading = "Validation rejected"): void => send(page.message(heading));
    const method = request.method ?? "GET";

    if (method === "GET" && url.pathname === "/app") return send(page.wrapper(fault));
    if (method === "GET" && url.pathname === "/search") return send(page.search(fault));
    if (method === "POST" && url.pathname === "/commit") {
      stats.commits += 1;
      return send(page.message("Transfer submitted"));
    }
    if (method === "POST" && url.pathname === "/reauth") {
      const form = await readForm(request);
      const parsed = reauthForm.safeParse(form === undefined ? undefined : fields(form));
      if (!parsed.success || !session.expired || session.member === undefined) return reject();
      session.expired = false;
      response.statusCode = 303;
      response.setHeader("Location", `/transfer?member=${encodeURIComponent(session.member.id)}`);
      return send("");
    }
    if (session.expired) return send(page.expired());
    if (method === "GET" && ["/member", "/accounts", "/transfer"].includes(url.pathname)) {
      const parsed = memberQuery.safeParse(fields(url.searchParams));
      if (!parsed.success) return reject();
      const member = members.find((value) => value.id === parsed.data.member);
      if (url.pathname === "/member") stats.searchRequests += 1;
      if (member === undefined || fault === "not-found") return reject("Member not found");
      session.member = member;
      if (url.pathname === "/member") return send(page.memberDetail(member));
      if (fault === "permission") return reject("Permission denied");
      if (fault === "app-error") return reject("Application error");
      if (url.pathname === "/accounts") return send(page.accounts(member));
      if (fault === "expired" && !session.expiryUsed) {
        session.expired = true;
        session.expiryUsed = true;
        return send(page.expired());
      }
      return send(page.transfer(member, fault));
    }
    if (method === "POST" && url.pathname === "/review") {
      stats.reviewRequests += 1;
      const form = await readForm(request);
      const parsed = transferForm.safeParse(form === undefined ? undefined : fields(form));
      const member = session.member;
      if (!parsed.success || member === undefined || fault === "validation") return reject();
      const value = parsed.data;
      if (
        value.source === value.destination ||
        cents(value.amount) <= 0 ||
        !member.accounts.includes(value.source) ||
        !member.accounts.includes(value.destination)
      )
        return reject();
      const balance = value.source === member.accounts[0] ? member.balances[0] : member.balances[1];
      if (fault === "insufficient" || cents(value.amount) > balance)
        return reject("Insufficient funds");
      session.review = { ...value, member };
      session.readyAt = fault === "slow" ? Date.now() + delayMs : 0;
      if (session.readyAt > Date.now()) return send(page.loading(session.readyAt - Date.now()));
      return send(page.review(session.review, fault));
    }
    if (method === "GET" && url.pathname === "/review") {
      if (session.review === undefined) return reject();
      if (session.readyAt > Date.now()) return send(page.loading(session.readyAt - Date.now()));
      return send(page.review(session.review, fault));
    }
    response.statusCode = 404;
    return reject();
  }

  const server = createServer((request, response) => {
    // The HTTP boundary returns fixed safe text; raw request/errors are never logged.
    void handle(request, response).catch(() => {
      if (!response.headersSent) response.statusCode = 500;
      if (!response.writableEnded) response.end(page.message("Application error"));
    });
  });
  server.requestTimeout = 5_000;
  server.headersTimeout = 5_000;
  server.keepAliveTimeout = 1_000;
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port ?? 0, "127.0.0.1", () => {
      server.removeListener("error", reject);
      resolve();
    });
  });
  const address = server.address();
  if (address === null || typeof address === "string") {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    throw new TypeError("Sandbox did not bind a loopback TCP address");
  }
  return {
    origin: `http://127.0.0.1:${address.port}`,
    stats,
    close: async () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error === undefined ? resolve() : reject(error)));
        server.closeAllConnections();
      }),
    setFault: (next) => {
      fault = next;
      for (const session of sessions.values()) session.expiryUsed = false;
    },
  };
}
