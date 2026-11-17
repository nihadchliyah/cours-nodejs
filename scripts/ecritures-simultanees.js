// Pour aller plus loin — que se passe-t-il quand deux requêtes écrivent en même temps ?
// Lance l'API sur un port libre avec un fichier JSON temporaire (le vrai data/ n'est pas touché),
// envoie N créations de produit EN MÊME TEMPS, puis compte ce qui a vraiment été enregistré.
// Lancement : npm run demo:concurrence   (ou : node scripts/ecritures-simultanees.js 50)
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const N = Number(process.argv[2] ?? 20);

// Le gestionnaire d'erreurs affiche les erreurs 500 avec console.error : on les collecte pour le résumé
const erreursServeur = [];
console.error = (err) => erreursServeur.push(err?.message ?? String(err));

process.env.FICHIER_PRODUITS = join(await mkdtemp(join(tmpdir(), "produits-")), "produits.json");
const { creerApp } = await import("../src/app.js");

const serveur = creerApp().listen(0);
await new Promise((ok) => serveur.once("listening", ok));
const url = `http://localhost:${serveur.address().port}/api/produits`;

await fetch(url); // crée le fichier avec les 3 produits de départ

const reponses = await Promise.all(
  Array.from({ length: N }, (_, i) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom: `Produit ${i + 1}`, prix: 1, categorie: "jeu" }),
    }).then(async (r) => ({ status: r.status, corps: await r.json() })),
  ),
);

const reussies = reponses.filter((r) => r.status === 201);
const idsRenvoyes = reussies.map((r) => r.corps.id);
console.log(`${N} créations envoyées en même temps`);
console.log(`- réponses 201 : ${reussies.length}, réponses en erreur : ${N - reussies.length}`);
if (erreursServeur.length) {
  console.log(`  erreurs côté serveur : ${[...new Set(erreursServeur)].join(" | ")}`);
  console.log("  (une requête a lu le fichier pendant qu'une autre était en train de le réécrire)");
}
console.log(`- identifiants distincts renvoyés au client : ${new Set(idsRenvoyes).size} (pour ${reussies.length} créations « réussies »)`);

try {
  const contenu = JSON.parse(await readFile(process.env.FICHIER_PRODUITS, "utf8"));
  console.log(`- produits réellement ajoutés dans le fichier : ${contenu.length - 3} (attendu : ${reussies.length})`);
} catch (err) {
  console.log(`- le fichier JSON est même corrompu : ${err.message}`);
}

serveur.closeAllConnections();
serveur.close();
