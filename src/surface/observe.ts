import { randomUUID } from "node:crypto";
import type { Frame, Page } from "playwright";
import { Binding, type Expression, StaticLabel } from "../domain/actions.js";
import { Fault, type Screen, type TransferInput } from "../domain/contract.js";
import { headings } from "../policy/profile.js";
export type Control = {
  readonly tag: string;
  readonly role: "button" | "link" | "textbox" | "combobox";
  readonly name: string;
  readonly nearbyLabel: string;
  readonly type: string;
  readonly value: string;
  readonly enabled: boolean;
  readonly options: readonly string[];
};
export type Candidate = {
  readonly id: string;
  readonly binding: Binding;
  readonly control: Control;
};
export type Observation = {
  readonly id: string;
  readonly screen: Screen;
  readonly candidates: readonly Candidate[];
  readonly member: string;
  readonly text: string;
  readonly controls: readonly Control[];
};
export function workspace(page: Page): Frame {
  const frames = page.frames().filter((f) => f.name() === "Workspace");
  if (frames.length > 1) throw new Fault("TARGET_AMBIGUOUS");
  const frame = frames[0];
  if (!frame) throw new Fault("TARGET_NOT_FOUND");
  return frame;
}
function symbolic(text: string, input: TransferInput): Expression | null {
  for (const name of ["memberId", "sourceAccountRef", "destinationAccountRef"] as const)
    if (text === input[name]) return { kind: "input", name, transform: "identity" };
  const staticLabel = StaticLabel.safeParse(text);
  return staticLabel.success ? { kind: "literal", text: staticLabel.data } : null;
}
export async function observe(page: Page, input: TransferInput): Promise<Observation> {
  const frame = workspace(page);
  const data = await frame.locator("body").evaluate((body) => {
    const visible = (element: Element) =>
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== "hidden" &&
      getComputedStyle(element).display !== "none";
    const controls = Array.from(body.querySelectorAll("button,a,input,select"))
      .filter(visible)
      .slice(0, 80)
      .flatMap((element) => {
        let role: "button" | "link" | "textbox" | "combobox";
        let name = "";
        let value = "";
        let type = "";
        let enabled = true;
        let options: string[] = [];
        if (element instanceof HTMLInputElement) {
          if (["hidden", "password"].includes(element.type)) return [];
          role = "textbox";
          type = element.type;
          name = Array.from(element.labels ?? [])
            .map((l) => l.textContent?.trim() ?? "")
            .join(" ");
          value = element.value;
          enabled = !element.disabled;
        } else if (element instanceof HTMLSelectElement) {
          role = "combobox";
          name = Array.from(element.labels ?? [])
            .map((l) => l.textContent?.trim() ?? "")
            .join(" ");
          value = element.selectedOptions[0]?.textContent?.trim() ?? "";
          options = Array.from(element.options)
            .slice(0, 40)
            .map((o) => o.textContent?.trim() ?? "");
          enabled = !element.disabled;
        } else if (element instanceof HTMLButtonElement) {
          role = "button";
          name = element.textContent?.trim() ?? "";
          type = element.type;
          enabled = !element.disabled;
        } else if (element instanceof HTMLAnchorElement) {
          role = "link";
          name = element.textContent?.trim() ?? "";
        } else return [];
        const row = element.closest("tr");
        const nearbyLabel = row?.cells[0]?.textContent?.trim() ?? "";
        return [
          {
            role,
            name,
            value,
            type,
            enabled,
            options,
            nearbyLabel,
            tag: element.tagName.toLowerCase(),
          },
        ];
      });
    if (Array.from(body.querySelectorAll("dialog,[role=dialog],[aria-modal=true]")).some(visible))
      return { controls: [], titles: [], member: "", text: "", modal: true };
    const titles = Array.from(body.querySelectorAll("h1,h2,[role=alert]"))
      .filter(visible)
      .map((h) => h.textContent?.trim() ?? "");
    const memberRows = Array.from(body.querySelectorAll("tr")).filter(
      (r) => visible(r) && r.cells[0]?.textContent?.trim() === "Member ID",
    );
    const member =
      memberRows.length === 1 ? (memberRows[0]?.cells[1]?.textContent?.trim() ?? "") : "";
    // Clone visible content to exclude all values in password controls, scripts, and hidden subtrees.
    const text = Array.from(body.querySelectorAll("h1,h2,p,th,td,label,button,a,option"))
      .filter(visible)
      .map((e) => (e instanceof HTMLElement ? e.innerText.trim() : ""))
      .join("\n")
      .slice(0, 10000);
    return { controls, titles, member, text, modal: false };
  });
  if (data.modal) throw new Fault("UNEXPECTED_MODAL");
  const screens = [...new Set(data.titles.flatMap((t) => (headings[t] ? [headings[t]] : [])))];
  if (screens.length > 1) throw new Fault("STATE_AMBIGUOUS");
  const screen = screens[0] ?? "unknown";
  const id = randomUUID();
  const candidates: Candidate[] = [];
  for (const control of data.controls) {
    const name = symbolic(control.name, input);
    const binding =
      control.role === "textbox" && control.nearbyLabel === "Amount USD" && !control.name
        ? Binding.parse({
            strategy: "table-label",
            frame: "Workspace",
            role: "textbox",
            label: "Amount USD",
          })
        : name
          ? Binding.parse({ strategy: "role", frame: "Workspace", role: control.role, name })
          : null;
    if (binding) candidates.push({ id: `${id}:${candidates.length}`, binding, control });
  }
  return { id, screen, candidates, member: data.member, text: data.text, controls: data.controls };
}
