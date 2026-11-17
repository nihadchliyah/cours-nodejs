import { z } from "zod";

// Paramètres de GET /api/taches?page=2&limite=5&faite=false&q=node
export const listeQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(10),
  faite: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  q: z.string().trim().optional(),
});
