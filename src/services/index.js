export const ia =
  process.env.IA_FOURNISSEUR === "bouchon" ? await import("./ia.bouchon.js") : await import("./ia.js");
