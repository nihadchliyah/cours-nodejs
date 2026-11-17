// Point d'entrée vérifié par la mission du lab (exercice 2) : PORT=3999 node src/index.js
// Contient aussi les exercices 3 (avis) et 5 (image), qui ne changent pas les contrôles.
// La clé d'API (exercice 4) n'est PAS activée ici : sinon le POST invalide de la mission
// recevrait 401 au lieu de 400. Version protégée : src/index-protege.js
import { creerApp } from "./app.js";

const PORT = process.env.PORT ?? 3000;

creerApp().listen(PORT, () => {
  console.log(`API catalogue sur http://localhost:${PORT}/api/produits`);
});
