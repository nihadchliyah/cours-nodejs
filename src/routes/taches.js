import { Router } from "express";
import * as depot from "../depots/taches.depot.js";
import { listeQuery } from "../schemas.js";

export const routeurTaches = Router();

routeurTaches.get("/", async (req, res) => {
  const resultat = listeQuery.safeParse(req.query);
  if (!resultat.success) {
    return res.status(400).json({
      erreur: "Paramètres invalides",
      details: resultat.error.issues.map((i) => ({ champ: i.path.join("."), message: i.message })),
    });
  }
  res.json(await depot.lister(resultat.data));
});
