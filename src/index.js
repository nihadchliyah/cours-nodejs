// Point d'entrée vérifié par la mission du lab (exercice 2) : PORT=3999 node src/index.js
import { creerApp } from "./app.js";

const PORT = process.env.PORT ?? 3000;

creerApp().listen(PORT, () => {
  console.log(`API catalogue sur http://localhost:${PORT}/api/produits`);
});
