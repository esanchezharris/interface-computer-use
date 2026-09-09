import type { Page } from "playwright";
import { StaticLabel } from "../domain/actions.js";
import { type Snapshot, Snapshot as SnapshotSchema } from "../evidence/store.js";
import { safeRoute } from "../policy/profile.js";
export async function snapshot(page: Page): Promise<Snapshot> {
  const frames = [];
  for (const frame of page.frames().slice(0, 10)) {
    const structures = await frame.locator("body").evaluate((body) =>
      Array.from(body.querySelectorAll("input,select,button,a"))
        .slice(0, 100)
        .map((element) => {
          const label =
            element instanceof HTMLInputElement || element instanceof HTMLSelectElement
              ? Array.from(element.labels ?? [])
                  .map((l) => l.textContent?.trim() ?? "")
                  .join(" ") ||
                element.closest("tr")?.cells[0]?.textContent?.trim() ||
                ""
              : (element.textContent?.trim() ?? "");
          return {
            tag: element.tagName.toLowerCase(),
            label,
            visible:
              element.getClientRects().length > 0 &&
              getComputedStyle(element).visibility !== "hidden",
            enabled:
              !(
                element instanceof HTMLInputElement ||
                element instanceof HTMLSelectElement ||
                element instanceof HTMLButtonElement
              ) || !element.disabled,
          };
        }),
    );
    const controls = structures.map((c) => ({
      ...c,
      label: StaticLabel.safeParse(c.label).success ? c.label : "[REDACTED]",
      values: "[REDACTED]",
      matches: structures.filter((other) => other.tag === c.tag && other.label === c.label).length,
    }));
    frames.push({
      scope:
        frame === page.mainFrame()
          ? "root"
          : frame.name() === "Workspace"
            ? "Workspace"
            : "unknown",
      route: safeRoute(frame.url()),
      controls,
    });
  }
  return SnapshotSchema.parse({ redacted: true, frames });
}
