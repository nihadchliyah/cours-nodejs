import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { authentifier } from "../middlewares/authentifier.js";
import { valider } from "../middlewares/valider.js";
import { schemaQuestion } from "../schemas.js";
import { ia } from "../services/index.js";

export const routeurAssistant = Router();

const limiteParMinute = rateLimit({
  windowMs: 60_000,
  limit: 10,
  keyGenerator: (req) => String(req.utilisateur.sub),
  message: { erreur: "Trop de questions, réessayez dans une minute" },
});

routeurAssistant.post("/", authentifier, limiteParMinute, valider(schemaQuestion), async (req, res) => {
  let resultat;
  try {
    resultat = await ia.repondre(req.valide.question);
  } catch (err) {
    console.error("IA :", err.message);
    return res.status(503).json({ erreur: "Assistant indisponible pour le moment" });
  }
  const { texte, jetons } = resultat;
  console.log(`assistant ${req.utilisateur.sub} ${jetons.input_tokens}+${jetons.output_tokens} jetons`);
  res.json({ reponse: texte });
});
