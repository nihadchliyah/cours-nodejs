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

routeurAssistant.post("/flux", ...garde, async (req, res) => {
  res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
  res.flushHeaders();

  const annulation = new AbortController();
  res.on("close", () => {
    if (!res.writableEnded) annulation.abort();
  });

  let mots = 0;
  let jetons;
  try {
    const flux = ia.repondreEnFlux(req.valide.question, {
      signal: annulation.signal,
      surJetons: (j) => (jetons = j),
    });
    for await (const morceau of flux) {
      if (annulation.signal.aborted) break;
      res.write(`data: ${JSON.stringify({ delta: morceau })}\n\n`);
      mots++;
    }
    if (!annulation.signal.aborted) res.write("event: fin\ndata: {}\n\n");
  } catch (err) {
    if (!annulation.signal.aborted) {
      console.error("IA :", err.message);
      res.write(`event: erreur\ndata: ${JSON.stringify({ message: "Service indisponible" })}\n\n`);
    }
  } finally {
    if (annulation.signal.aborted) console.log(`flux interrompu par le client (${mots} mots émis)`);
    else console.log(`flux terminé (${mots} mots émis)`);
    if (jetons) await consommation.enregistrer(req.utilisateur.sub, jetons);
    res.end();
  }
});
