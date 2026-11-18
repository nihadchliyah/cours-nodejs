import bcrypt from "bcrypt";
import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { valider } from "../middlewares/valider.js";
import { schemaConnexion } from "../schemas.js";
import { creerJeton } from "../securite/jetons.js";

export const routeurAuth = Router();

routeurAuth.post("/connexion", valider(schemaConnexion), async (req, res) => {
  const { email, motDePasse } = req.valide;
  const utilisateur = await prisma.utilisateur.findUnique({ where: { email } });
  const valide = utilisateur && (await bcrypt.compare(motDePasse, utilisateur.motDePasse));
  if (!valide) return res.status(401).json({ erreur: "E-mail ou mot de passe incorrect" });
  res.json({ accessToken: await creerJeton(utilisateur) });
});
