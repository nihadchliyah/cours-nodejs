import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { schemaInscription } from "../schemas.js";
import { hacherDansWorker } from "../securite/hachage.js";

export const routeurAuth = Router();

routeurAuth.post("/inscription", async (req, res) => {
  const resultat = schemaInscription.safeParse(req.body);
  if (!resultat.success) {
    return res.status(400).json({
      erreur: "Données invalides",
      details: resultat.error.issues.map((i) => ({ champ: i.path.join("."), message: i.message })),
    });
  }

  const { email, nom, motDePasse } = resultat.data;
  const existant = await prisma.utilisateur.findUnique({ where: { email } });
  if (existant) return res.status(409).json({ erreur: "Cet e-mail est déjà utilisé" });

  const hash = await hacherDansWorker(motDePasse);
  const utilisateur = await prisma.utilisateur.create({
    data: { email, nom, motDePasse: hash },
    select: { id: true, email: true, nom: true },
  });
  res.status(201).json(utilisateur);
});
