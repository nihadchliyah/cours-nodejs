import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
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

function champCsv(valeur) {
  const texte = valeur instanceof Date ? valeur.toISOString() : String(valeur ?? "");
  return /[;"\r\n]/.test(texte) ? `"${texte.replaceAll('"', '""')}"` : texte;
}

async function* lignesCsv() {
  yield "id;titre;faite;proprietaireId;creeLe\n";
  for await (const lot of depot.parLots(500)) {
    yield lot
      .map((t) => [t.id, t.titre, t.faite, t.proprietaireId, t.creeLe].map(champCsv).join(";") + "\n")
      .join("");
  }
}

routeurTaches.get("/export.csv", async (req, res) => {
  res.attachment("taches.csv");
  await pipeline(Readable.from(lignesCsv()), res);
});
