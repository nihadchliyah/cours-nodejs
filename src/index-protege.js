// Exercice 4 : même API, écritures (POST, PATCH, DELETE) protégées par X-Api-Key.
// Lancement : API_KEY=ma-cle node src/index-protege.js
import { creerApp } from "./app.js";

if (!process.env.API_KEY) {
  console.error("API_KEY n'est pas définie : impossible de démarrer la version protégée.");
  process.exit(1);
}

const PORT = process.env.PORT ?? 3000;

creerApp({ protegerEcritures: true }).listen(PORT, () => {
  console.log(`API protégée sur http://localhost:${PORT}/api/produits`);
});
