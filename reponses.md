# Exercices 5 — réponses

## Exercice 1 — Filtrer un CSV en stream

`src/filtrer.js` : `createReadStream` → lecture ligne par ligne avec `readline` → générateur qui ne garde que les lignes dont la 3e colonne vaut `erreur` → `createWriteStream`, le tout dans `pipeline` (contre-pression et erreurs gérées).

Testé avec `--max-old-space-size=64` sur 200 000 lignes. Mission vérifiée par le lab : 15 385 lignes.

## Exercice 2 — Export CSV en streaming (api-taches)

- `GET /api/taches/export.csv` : `res.attachment("taches.csv")` donne `Content-Disposition: attachment` et `Content-Type: text/csv`.
- Les tâches sont lues par lots de 500 avec un curseur sur l'id (`where: { id: { gt: dernierId } }`), puis envoyées avec `Readable.from(generateur)` et `pipeline` vers `res`.
- Test : 1 225 tâches en base → 1 226 lignes dans le fichier (en-tête compris).

## Exercice 3 — Hachage dans un worker (api-taches)

- `hacherDansWorker(motDePasse)` lance `src/workers/hachage.js` (bcrypt coût 14) et renvoie une Promise.
- Pendant une inscription (1,2 s), `GET /sante` a répondu 12 fois, la plus lente en 64 ms.
- Pourquoi bcrypt n'en a pas besoin en pratique : `bcrypt.hash()` (asynchrone) s'exécute déjà hors de la boucle d'événements, dans le pool de threads de libuv (4 threads par défaut, réglable avec `UV_THREADPOOL_SIZE`). Seul `hashSync` bloque.
  - `bcrypt.hashSync` coût 14 : 984 ms, boucle bloquée 984 ms
  - `bcrypt.hash` coût 14 : 1 020 ms, boucle bloquée 11 ms au plus
- Un worker reste utile pour du calcul lourd en JavaScript pur (par exemple `bcryptjs`).

## Exercice 4 — Typer un dépôt

`src/depot.ts` : interface `DepotTaches` et types du client Prisma généré (`PrismaClient`, `Prisma.TacheCreateInput`, `Tache`). `tsc` en mode strict : aucune erreur, aucun `any`.

## Exercice 5 — Lire les erreurs de tsc

1. `t.id === req.params.id` compare un `number` à une `string` (TS2367) → `Number(req.params.id)`.
2. `find` peut renvoyer `undefined`, donc `tache` peut être `undefined` (TS18048) → réponse 404 si la tâche n'existe pas.
3. Soustraction de deux `Date` (TS2362 / TS2363), et `echeance` est optionnelle → `echeance.getTime() - Date.now()`, `null` s'il n'y a pas d'échéance.

## Pour aller plus loin — autocannon sur /sante

Labo : 12 cœurs. Commande : `npx autocannon -c 50 -d 10 http://localhost:3000/sante`.

| Configuration | autocannon normal | autocannon `-w 4` |
|---|---|---|
| 1 processus | 19 866 req/s | 14 935 req/s |
| cluster, 4 workers | — | 20 443 req/s |
| cluster, 12 workers | 11 799 req/s | 12 378 req/s |

Facteur obtenu : ×1,4 au mieux (4 workers), et moins de ×1 avec 12 workers, très loin de ×12.

- autocannon tourne sur la même machine et prend lui aussi du CPU : avec 12 workers, tout le monde se partage les mêmes cœurs.
- `/sante` ne fait presque rien : le temps passe surtout dans le réseau et le noyau, pas dans le JavaScript.
- Le labo est un conteneur Docker sur le PC, avec d'autres programmes qui tournent à côté.

Le cluster apporte vraiment quelque chose quand chaque requête demande du calcul et que le serveur a sa propre machine, séparée de celle qui envoie la charge.
