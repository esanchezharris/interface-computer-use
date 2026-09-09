import { startSandbox } from "../../sandbox/server.js";
import { reportError } from "./args.js";

try {
  if (process.argv.includes("--help"))
    process.stdout.write("sandbox: loopback synthetic app; SANDBOX_PORT defaults to 4173\n");
  else {
    const { SANDBOX_PORT } = process.env;
    const app = await startSandbox({ port: Number(SANDBOX_PORT ?? 4173) });
    process.stdout.write(`Synthetic app: ${app.origin}/app\n`);
    process.once("SIGINT", () => void app.close());
    process.once("SIGTERM", () => void app.close());
  }
} catch (error) {
  reportError(error);
}
