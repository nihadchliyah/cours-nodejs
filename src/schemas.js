import { z } from "zod";

z.config(z.locales.fr()); // messages d'erreur Zod en français

export const CATEGORIES = ["livre", "jeu", "musique"];

// Champs d'un produit, sans valeur par défaut : la même base sert à la création et au PATCH
const champsProduit = z.object({
  nom: z.string().trim().min(2, "2 caractères au moins").max(60, "60 caractères au plus"),
  prix: z.number().positive("Le prix doit être positif").multipleOf(0.01, "Deux décimales au plus"),
  stock: z.number().int("Le stock doit être un entier").min(0, "Le stock ne peut pas être négatif"),
  categorie: z.enum(CATEGORIES),
});

// Création : stock vaut 0 s'il est absent
export const schemaCreation = champsProduit.extend({
  stock: champsProduit.shape.stock.default(0),
});

// Modification partielle : tous les champs facultatifs, mais au moins un
export const schemaModification = champsProduit
  .partial()
  .refine((o) => Object.keys(o).length > 0, "Aucun champ à modifier");

// GET /api/produits?page=2&limite=5&categorie=livre
export const schemaListe = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(10),
  categorie: z.enum(CATEGORIES).optional(),
});

// Exercice 3 — un avis
export const schemaAvis = z.object({
  note: z.number().int("La note doit être un entier").min(1).max(5),
  commentaire: z.string().trim().max(500, "500 caractères au plus").optional(),
});
