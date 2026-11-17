import express from "express";
import { valider } from "../middlewares/valider.js";
import { schemaCreation, schemaListe, schemaModification } from "../schemas.js";

// Stockage en mémoire (perdu au redémarrage)
const produits = new Map();
let prochainId = 1;

function ajouter(donnees) {
  const produit = { id: prochainId++, ...donnees };
  produits.set(produit.id, produit);
  return produit;
}

// Quelques produits de départ
ajouter({ nom: "Le Petit Prince", prix: 8.9, stock: 12, categorie: "livre" });
ajouter({ nom: "Carcassonne", prix: 29.99, stock: 0, categorie: "jeu" });
ajouter({ nom: "Kind of Blue", prix: 15.5, stock: 3, categorie: "musique" });

export function creerRouteurProduits() {
  const router = express.Router();

  // Exercice 3 : router.param charge le produit UNE fois pour toutes les routes avec :id
  router.param("id", (req, res, next, id) => {
    const produit = produits.get(Number(id));
    if (!produit) return res.status(404).json({ erreur: `Produit ${id} introuvable` });
    req.produit = produit;
    next();
  });

  // Liste : pagination + filtre ?categorie=
  router.get("/", valider(schemaListe, "query"), (req, res) => {
    const { page, limite, categorie } = req.valide.query;
    const tous = [...produits.values()].filter((p) => !categorie || p.categorie === categorie);
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

  router.post("/", valider(schemaCreation), (req, res) => {
    const produit = ajouter(req.valide.body);
    res.status(201).location(`${req.baseUrl}/${produit.id}`).json(produit);
  });

  router.patch("/:id", valider(schemaModification), (req, res) => {
    Object.assign(req.produit, req.valide.body);
    res.json(req.produit);
  });

  router.delete("/:id", (req, res) => {
    if (req.produit.stock !== 0) {
      return res.status(409).json({
        erreur: `Suppression impossible : il reste ${req.produit.stock} article(s) en stock`,
      });
    }
    produits.delete(req.produit.id);
    res.status(204).end();
  });

  return router;
}
