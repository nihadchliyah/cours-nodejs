import "dotenv/config";
import { prisma } from "../src/db/prisma.js";

// Seeder rejouable : upsert sur des champs uniques, donc aucun doublon
const utilisateurs = [
  { email: "alice@exemple.fr", nom: "Alice" },
  { email: "bob@exemple.fr", nom: "Bob" },
];

const titres = [
  "Faire les courses", "Réviser Node.js", "Préparer le TP 2", "Lire la doc Prisma",
  "Appeler le dentiste", "Ranger le bureau", "Écrire le rapport", "Réviser Express",
  "Tester l'API avec curl", "Mettre à jour le README", "Configurer ESLint", "Lire la doc Mongoose",
  "Faire la vaisselle", "Payer le loyer", "Préparer la réunion", "Corriger les bugs",
  "Sauvegarder le projet", "Réviser les codes HTTP", "Écrire les tests", "Déployer l'API",
  "Apprendre TypeScript", "Lire un article sur JWT", "Nettoyer le dépôt Git", "Planifier la semaine",
  "Réviser SQL",
];

const comptes = [];
for (const u of utilisateurs) {
  comptes.push(await prisma.utilisateur.upsert({ where: { email: u.email }, update: {}, create: u }));
}

for (const [i, titre] of titres.entries()) {
  const proprietaireId = comptes[i % comptes.length].id;
  await prisma.tache.upsert({
    where: { titre_proprietaireId: { titre, proprietaireId } },
    update: {},
    create: { titre, proprietaireId, faite: i % 3 === 0 },
  });
}

// Compteur tachesEnCours recalculé à partir des tâches (utile pour l'exercice 5)
for (const c of comptes) {
  const tachesEnCours = await prisma.tache.count({ where: { proprietaireId: c.id, faite: false } });
  await prisma.utilisateur.update({ where: { id: c.id }, data: { tachesEnCours } });
}

console.log(`Seed terminé : ${await prisma.utilisateur.count()} utilisateurs, ${await prisma.tache.count()} tâches`);
await prisma.$disconnect();
