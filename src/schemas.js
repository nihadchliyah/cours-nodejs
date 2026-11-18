import { z } from "zod";

export const schemaConnexion = z.object({
  email: z.email(),
  motDePasse: z.string().min(1),
});

export const schemaQuestion = z.object({
  question: z.string().trim().min(1).max(500),
});
