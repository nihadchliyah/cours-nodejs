import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/db/prisma.js";

const jours = (n) => new Date(Date.now() + n * 86400000);
const motDePasse = await bcrypt.hash("motdepasse123", 10);

const utilisateurs = [
  { email: "alice@exemple.fr", nom: "Alice" },
  { email: "bob@exemple.fr", nom: "Bob" },
];

const ouvrages = [
  { id: 1, titre: "Node.js pour les débutants", auteur: "Claire Martin" },
  { id: 2, titre: "Le Petit Prince", auteur: "Antoine de Saint-Exupéry" },
  { id: 3, titre: "Apprendre SQL", auteur: "Paul Durand" },
  { id: 4, titre: "Les Misérables", auteur: "Victor Hugo" },
  { id: 5, titre: "JavaScript moderne", auteur: "Sophie Bernard" },
  { id: 6, titre: "Dune", auteur: "Frank Herbert" },
];

const comptes = [];
for (const u of utilisateurs) {
  comptes.push(
    await prisma.utilisateur.upsert({ where: { email: u.email }, update: {}, create: { ...u, motDePasse } }),
  );
}

for (const o of ouvrages) {
  await prisma.ouvrage.upsert({ where: { id: o.id }, update: {}, create: o });
}

const emprunts = [
  { id: 1, ouvrageId: 1, utilisateurId: comptes[0].id, retourPrevuLe: jours(3) },
  { id: 2, ouvrageId: 2, utilisateurId: comptes[0].id, retourPrevuLe: jours(12) },
  { id: 3, ouvrageId: 3, utilisateurId: comptes[0].id, retourPrevuLe: jours(-10), rendu: true },
  { id: 4, ouvrageId: 4, utilisateurId: comptes[1].id, retourPrevuLe: jours(2) },
  { id: 5, ouvrageId: 5, utilisateurId: comptes[1].id, retourPrevuLe: jours(5) },
];

for (const e of emprunts) {
  await prisma.emprunt.upsert({ where: { id: e.id }, update: {}, create: e });
  if (!e.rendu) await prisma.ouvrage.update({ where: { id: e.ouvrageId }, data: { disponible: false } });
}

console.log(
  `Seed : ${await prisma.utilisateur.count()} utilisateurs, ${await prisma.ouvrage.count()} ouvrages, ${await prisma.emprunt.count()} emprunts`,
);
await prisma.$disconnect();
