import express from "express";
import { gestionnaireErreurs, routeInconnue } from "./middlewares/erreurs.js";
import { creerRouteurProduits } from "./routes/produits.js";

export function creerApp({ protegerEcritures = false } = {}) {
  const app = express();

  app.use(express.json());

  app.use("/api/produits", creerRouteurProduits({ protegerEcritures }));

  app.use(routeInconnue); // 404, après toutes les routes
  app.use(gestionnaireErreurs); // toujours en dernier
  return app;
}
