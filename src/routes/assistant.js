import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import * as consommation from "../depots/consommation.js";
import { authentifier } from "../middlewares/authentifier.js";
import { quotaIa } from "../middlewares/quotaIa.js";
import { valider } from "../middlewares/valider.js";
import { schemaQuestion } from "../schemas.js";
import { ia } from "../services/index.js";

export const routeurAssistant = Router();

const QUOTA_JETONS_JOUR = Number(process.env.QUOTA_JETONS_JOUR ?? 20000);

const limiteParMinute = rateLimit({
  windowMs: 60_000,
  limit: 10,
  keyGenerator: (req) => String(req.utilisateur.sub),
  message: { erreur: "Trop de questions, réessayez dans une minute" },
});

const garde = [authentifier, limiteParMinute, quotaIa(QUOTA_JETONS_JOUR), valider(schemaQuestion)];

routeurAssistant.post("/", ...garde, async (req, res) => {
  let resultat;
  try {
    resultat = await ia.repondre(req.valide.question);
  } catch (err) {
    console.error("IA :", err.message);
    return res.status(503).json({ erreur: "Assistant indisponible pour le moment" });
  }
  const { texte, jetons } = resultat;
  await consommation.enregistrer(req.utilisateur.sub, jetons);
  console.log(`assistant ${req.utilisateur.sub} ${jetons.input_tokens}+${jetons.output_tokens} jetons`);
  res.json({ reponse: texte });
});
