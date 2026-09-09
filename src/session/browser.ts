import { type Browser, type BrowserContext, chromium, type Page } from "playwright";
import { z } from "zod";
import { Fault, type Screen, type TransferInput } from "../domain/contract.js";
import { type Actor, Evidence } from "../evidence/store.js";
import { permittedRequest, validateOrigin } from "../policy/profile.js";
import { Session } from "./controller.js";

const Activity = z.strictObject({
  activity: z.enum(["activation", "field-change"]),
  field: z.enum(["member", "source", "destination", "amount", "credential", "unknown"]),
});
declare global {
  interface Window {
    cuaActivity: (event: z.infer<typeof Activity>) => Promise<void>;
  }
}
export type RuntimeOptions = {
  readonly origin: string;
  readonly input: TransferInput;
  readonly mode: "discovery" | "replay";
  readonly provenance: "live-model" | "development-fixture";
  readonly artifactHash: string | null;
  readonly evidenceRoot: string;
  readonly actor: Actor;
  readonly operator: boolean;
  readonly headed: boolean;
  readonly actionMs?: number;
  readonly waitMs?: number;
  readonly interventionMs?: number;
};
export class Runtime {
  readonly actionMs: number;
  readonly waitMs: number;
  private violation: Fault | null = null;
  readonly startedAt = performance.now();
  readonly completedDispatches = new Set<string>();
  lastScreen: Screen = "unknown";
  expectedScreen: Screen = "unknown";
  private constructor(
    readonly browser: Browser,
    readonly context: BrowserContext,
    readonly page: Page,
    readonly session: Session,
    readonly evidence: Evidence,
    readonly options: RuntimeOptions,
  ) {
    this.actionMs = options.actionMs ?? 5000;
    this.waitMs = options.waitMs ?? 10000;
  }
  static async create(options: RuntimeOptions): Promise<Runtime> {
    const origin = validateOrigin(options.origin);
    const browser = await chromium.launch({ headless: !options.headed });
    try {
      const context = await browser.newContext({ serviceWorkers: "block", acceptDownloads: false });
      const page = await context.newPage();
      const evidence = new Evidence(options.evidenceRoot, {
        mode: options.mode,
        actor: options.actor,
        origin: options.provenance,
        artifactHash: options.artifactHash,
        browserVersion: browser.version(),
      });
      const session = new Session(evidence, {
        actor: options.actor,
        operator: options.operator,
        interventionMs: options.interventionMs ?? 600000,
        settleMs: (options.actionMs ?? 5000) + 1000,
      });
      const runtime = new Runtime(browser, context, page, session, evidence, options);
      await context.route("**/*", async (route) => {
        const request = route.request();
        if (!permittedRequest(request.url(), request.method(), origin)) {
          runtime.violation = new Fault("POLICY_DENIED");
          await route.abort("blockedbyclient");
          return;
        }
        await route.continue();
      });
      page.on("dialog", (dialog) => {
        runtime.violation = new Fault("UNEXPECTED_MODAL");
        void dialog.dismiss().catch(() => {
          runtime.violation = new Fault("BROWSER_ERROR");
        });
      });
      page.on("download", (download) => {
        runtime.violation = new Fault("POLICY_DENIED");
        void download.cancel().catch(() => {
          runtime.violation = new Fault("BROWSER_ERROR");
        });
      });
      context.on("page", (extra) => {
        runtime.violation = new Fault("POLICY_DENIED");
        void extra.close().catch(() => {
          runtime.violation = new Fault("BROWSER_ERROR");
        });
      });
      await context.exposeBinding("cuaActivity", (_source, value: unknown) => {
        if (session.owner !== "HUMAN") return;
        const parsed = Activity.safeParse(value);
        if (parsed.success) {
          try {
            evidence.event({ kind: "operator-activity", actor: options.actor, ...parsed.data });
          } catch (error) {
            runtime.violation = new Fault("EVIDENCE_WRITE_FAILED");
            session.close();
            throw error;
          }
        }
      });
      await context.addInitScript(() => {
        const record = (event: Event) => {
          const element = event.target;
          if (!(element instanceof Element)) return;
          const name = element.getAttribute("name");
          const field =
            element instanceof HTMLInputElement && element.type === "password"
              ? "credential"
              : name === "member" ||
                  name === "source" ||
                  name === "destination" ||
                  name === "amount"
                ? name
                : "unknown";
          void window.cuaActivity({
            activity: event.type === "click" ? "activation" : "field-change",
            field,
          });
        };
        document.addEventListener("click", record, true);
        document.addEventListener("change", record, true);
      });
      page.on("framenavigated", () => {
        if (session.owner === "HUMAN")
          try {
            evidence.event({
              kind: "operator-activity",
              actor: options.actor,
              activity: "navigation",
              field: "unknown",
            });
          } catch {
            runtime.violation = new Fault("EVIDENCE_WRITE_FAILED");
            session.close();
          }
      });
      page.setDefaultTimeout(runtime.actionMs);
      page.setDefaultNavigationTimeout(runtime.actionMs);
      await session.dispatch(
        () => page.goto(`${origin}/app`, { waitUntil: "load" }),
        session.epoch,
      );
      runtime.check();
      return runtime;
    } catch (error) {
      await browser.close();
      throw error;
    }
  }
  check(): void {
    if (this.violation) throw this.violation;
  }
  async close(): Promise<void> {
    this.session.close();
    try {
      await this.context.close();
    } finally {
      await this.browser.close();
    }
  }
}
