# Exercices 2 — Express et API REST

API catalogue `/api/produits` avec Express 5 et Zod (cours Node.js, IT-Akademy).

## Lancer

```bash
npm install
npm run dev                          # http://localhost:3000/api/produits
API_KEY=ma-cle npm run start:protege # même API, écritures protégées par X-Api-Key
```

## Contenu

| Exercice | Fichiers |
|---|---|
| 1 — Trouver les bogues | `src/ex1-articles.js` |
| 2 — API catalogue (CRUD, pagination, filtre, Zod, 404, erreurs) | `src/app.js`, `src/routes/produits.js`, `src/schemas.js`, `src/middlewares/` |
| 3 — Sous-ressource `/api/produits/:id/avis` avec `router.param` | `src/routes/produits.js`, `src/schemas.js` |
| 4 — Clé d'API sur POST, PATCH, DELETE | `src/middlewares/cleApi.js`, `src/index-protege.js` |
| 5 — Image avec multer (PNG/JPEG, 500 Ko, 413) | `src/upload.js`, `src/middlewares/erreurs.js` |
| Pour aller plus loin — stockage dans un fichier JSON | `src/depots/produits.depot.js`, `scripts/ecritures-simultanees.js` |

## Pour aller plus loin : un fichier JSON au lieu du `Map`

Les produits ne sont plus dans un `Map` en mémoire mais dans `data/produits.json`
(créé au premier lancement). Chaque opération **relit tout le fichier, le modifie en
mémoire, puis le réécrit en entier** avec `node:fs/promises`. Les données survivent
maintenant à un redémarrage.

### Deux écritures en même temps

```bash
npm run demo:concurrence
```

Le script envoie 20 créations de produit en même temps. Résultat typique :

```
20 créations envoyées en même temps
- réponses 201 : 12, réponses en erreur : 8
  erreurs côté serveur : Unexpected end of JSON input
- identifiants distincts renvoyés au client : 3 (pour 12 créations « réussies »)
- produits réellement ajoutés dans le fichier : 3 (attendu : 12)
```

Trois problèmes apparaissent :

1. **Écritures perdues** : deux requêtes lisent le même contenu, ajoutent chacune leur
   produit, puis réécrivent le fichier. La seconde écrase la première, qui disparaît
   alors que le client a reçu un 201.
2. **Identifiants en double** : chaque requête calcule `max(id) + 1` sur le même
   contenu, donc plusieurs produits reçoivent le même identifiant.
3. **Fichier lu à moitié écrit** : `writeFile` vide le fichier puis le remplit. Une
   lecture qui tombe au milieu obtient un JSON incomplet, d'où des erreurs 500.

Node.js n'a qu'un seul thread, mais chaque `await` rend la main : entre la lecture et
l'écriture, d'autres requêtes s'exécutent.

### Pourquoi une base de données est la suite logique

On pourrait poser un verrou, écrire dans un fichier temporaire puis le renommer…
mais c'est exactement le travail d'une base de données :

- **transactions** et **verrous** : plusieurs écritures simultanées sans rien perdre ;
- **identifiants générés par la base** (auto-incrément), jamais en double ;
- on modifie **une ligne**, pas tout le fichier, ce qui reste rapide avec beaucoup de données ;
- **contraintes** (unicité, clés étrangères) vérifiées par la base elle-même.

C'est l'objet des séances suivantes : MongoDB avec Mongoose et PostgreSQL avec Prisma.
