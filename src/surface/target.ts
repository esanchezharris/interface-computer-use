import type { ElementHandle, Locator, Page } from "playwright";
import { type Binding, resolveExpression } from "../domain/actions.js";
import { Fault, type TransferInput, unreachable } from "../domain/contract.js";
import type { Effect } from "../policy/profile.js";
import { workspace } from "./observe.js";
export function locator(page: Page, binding: Binding, input: TransferInput): Locator {
  const frame = workspace(page);
  switch (binding.strategy) {
    case "role":
      return frame.getByRole(binding.role, {
        name: resolveExpression(binding.name, input),
        exact: true,
      });
    case "table-label":
      return frame
        .getByRole("row")
        .filter({ has: frame.getByRole("cell", { name: binding.label, exact: true }) })
        .locator("input:not([type=hidden]):not([type=password])");
    default:
      return unreachable(binding);
  }
}
export async function uniqueTarget(
  page: Page,
  binding: Binding,
  input: TransferInput,
): Promise<ElementHandle<HTMLElement | SVGElement>> {
  const target = locator(page, binding, input);
  const count = await target.count();
  if (count > 1) throw new Fault("TARGET_AMBIGUOUS");
  if (count === 0) throw new Fault("TARGET_NOT_FOUND");
  if (!(await target.isVisible()) || !(await target.isEnabled())) throw new Fault("TARGET_INVALID");
  const correct = await target.evaluate(
    (e, role) =>
      role === "button"
        ? e instanceof HTMLButtonElement
        : role === "link"
          ? e instanceof HTMLAnchorElement
          : role === "combobox"
            ? e instanceof HTMLSelectElement
            : e instanceof HTMLInputElement &&
              !["hidden", "password", "submit", "button"].includes(e.type),
    binding.role,
  );
  if (!correct) throw new Fault("TARGET_INVALID");
  const handle = await target.elementHandle();
  if (!handle) throw new Fault("TARGET_NOT_FOUND");
  return handle;
}
export async function effectOf(target: ElementHandle<HTMLElement | SVGElement>): Promise<Effect> {
  return target.evaluate((e) => ({
    tag: e.tagName.toLowerCase(),
    type: e instanceof HTMLInputElement || e instanceof HTMLButtonElement ? e.type : "",
    name: e.getAttribute("name") ?? "",
    href: e instanceof HTMLAnchorElement ? e.href : "",
    formAction:
      e instanceof HTMLButtonElement || e instanceof HTMLInputElement
        ? e.getAttribute("formaction")
          ? new URL(e.getAttribute("formaction") ?? "", document.baseURI).href
          : (e.form?.action ?? "")
        : "",
    method:
      e instanceof HTMLButtonElement || e instanceof HTMLInputElement
        ? (e.getAttribute("formmethod") ?? e.form?.method ?? "GET").toUpperCase()
        : "GET",
  }));
}
