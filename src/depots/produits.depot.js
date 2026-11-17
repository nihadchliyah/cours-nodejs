// Pour aller plus loin — les produits sont stockés dans un fichier JSON.
// Le fichier est relu puis réécrit EN ENTIER à chaque opération, avec node:fs/promises.
// Simple, mais fragile dès que deux requêtes écrivent en même temps :
// voir scripts/ecritures-simultanees.js et le README.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// FICHIER_PRODUITS permet d'utiliser un autre fichier (le script de démonstration s'en sert)
const FICHIER =
  process.env.FICHIER_PRODUITS ?? fileURLToPath(new URL("../../data/produits.json", import.meta.url));

const PRODUITS_DE_DEPART = [
  { id: 1, nom: "Le Petit Prince", prix: 8.9, stock: 12, categorie: "livre" },
  { id: 2, nom: "Carcassonne", prix: 29.99, stock: 0, categorie: "jeu" },
  { id: 3, nom: "Kind of Blue", prix: 15.5, stock: 3, categorie: "musique" },
];

async function lire() {
  try {
    return JSON.parse(await readFile(FICHIER, "utf8"));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    // Premier lancement : le fichier n'existe pas encore, on le crée
    await ecrire(PRODUITS_DE_DEPART);
    return structuredClone(PRODUITS_DE_DEPART);
  }
}

async function ecrire(produits) {
  await mkdir(dirname(FICHIER), { recursive: true });
  await writeFile(FICHIER, JSON.stringify(produits, null, 2) + "\n");
}

export async function lister() {
  return lire();
}

export async function trouver(id) {
  return (await lire()).find((p) => p.id === id);
}

export async function ajouter(donnees) {
  const produits = await lire();
  const id = produits.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  const produit = { id, ...donnees };
  produits.push(produit);
  await ecrire(produits);
  return produit;
}

export async function modifier(id, changements) {
  const produits = await lire();
  const produit = produits.find((p) => p.id === id);
  if (!produit) return undefined;
  Object.assign(produit, changements);
  await ecrire(produits);
  return produit;
}

export async function supprimer(id) {
  const produits = await lire();
  await ecrire(produits.filter((p) => p.id !== id));
}
