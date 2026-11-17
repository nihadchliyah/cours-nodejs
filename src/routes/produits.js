import express from "express";
import { valider } from "../middlewares/valider.js";
import { proteger } from "../middlewares/cleApi.js";
import { schemaAvis, schemaCreation, schemaListe, schemaModification } from "../schemas.js";
import { upload } from "../upload.js";
import * as depot from "../depots/produits.depot.js";

// Les produits sont dans data/produits.json (voir src/depots/produits.depot.js) ;
// les avis restent en mémoire.
const avisParProduit = new Map(); // id produit → tableau d'avis
let prochainIdAvis = 1;

/**
 * @param {{ protegerEcritures?: boolean }} options
 *   protegerEcritures : exige X-Api-Key sur POST, PATCH et DELETE (exercice 4)
 */
export function creerRouteurProduits({ protegerEcritures = false } = {}) {
  const router = express.Router();

  if (protegerEcritures) router.use(proteger);

  // Exercice 3 : router.param charge le produit UNE fois pour toutes les routes avec :id
  router.param("id", async (req, res, next, id) => {
    const produit = await depot.trouver(Number(id));
    if (!produit) return res.status(404).json({ erreur: `Produit ${id} introuvable` });
    req.produit = produit;
    next();
  });

  // Liste : pagination + filtre ?categorie=
  router.get("/", valider(schemaListe, "query"), async (req, res) => {
    const { page, limite, categorie } = req.valide.query;
    const tous = (await depot.lister()).filter((p) => !categorie || p.categorie === categorie);
    const debut = (page - 1) * limite;
    res.json({
      donnees: tous.slice(debut, debut + limite),
      page,
      limite,
      total: tous.length,
      pages: Math.ceil(tous.length / limite),
    });
  });

  router.get("/:id", (req, res) => res.json(req.produit));

  router.post("/", valider(schemaCreation), async (req, res) => {
    const produit = await depot.ajouter(req.valide.body);
    res.status(201).location(`${req.baseUrl}/${produit.id}`).json(produit);
  });

  router.patch("/:id", valider(schemaModification), async (req, res) => {
    const produit = await depot.modifier(req.produit.id, req.valide.body);
    res.json(produit);
  });

  router.delete("/:id", async (req, res) => {
    if (req.produit.stock !== 0) {
      return res.status(409).json({
        erreur: `Suppression impossible : il reste ${req.produit.stock} article(s) en stock`,
      });
    }
    await depot.supprimer(req.produit.id);
    avisParProduit.delete(req.produit.id);
    res.status(204).end();
  });

  // Exercice 3 : sous-ressource /api/produits/:id/avis
  router.get("/:id/avis", (req, res) => {
    res.json(avisParProduit.get(req.produit.id) ?? []);
  });

  router.post("/:id/avis", valider(schemaAvis), (req, res) => {
    const avis = { id: prochainIdAvis++, produitId: req.produit.id, ...req.valide.body };
    if (!avisParProduit.has(req.produit.id)) avisParProduit.set(req.produit.id, []);
    avisParProduit.get(req.produit.id).push(avis);
    res.status(201).json(avis);
  });

  // Exercice 5 : image du produit (champ multipart « image »)
  router.post("/:id/image", upload.single("image"), async (req, res) => {
    if (!req.file) return res.status(400).json({ erreur: "Fichier manquant (champ « image »)" });
    const url = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
    const produit = await depot.modifier(req.produit.id, { image: url });
    res.status(201).json({ url, produit });
  });

  return router;
}
