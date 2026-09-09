import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "openai" || specifier.includes("/discovery/"))
      throw new Error("MODEL_IMPORT_FORBIDDEN");
    return nextResolve(specifier, context);
  },
});
