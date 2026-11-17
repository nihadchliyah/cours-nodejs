// Exercice 5 — configuration de multer pour les images de produits
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import multer from "multer";

export const dossierImages = fileURLToPath(new URL("../public/images/", import.meta.url));
mkdirSync(dossierImages, { recursive: true });

const EXTENSIONS = { "image/png": ".png", "image/jpeg": ".jpg" };

export const upload = multer({
  storage: multer.diskStorage({
    destination: dossierImages,
    // Nom généré : on n'utilise jamais le nom envoyé par le client
    filename: (req, file, cb) => cb(null, `${randomUUID()}${EXTENSIONS[file.mimetype]}`),
  }),
  limits: { fileSize: 500 * 1024 }, // 500 Ko → au-delà, MulterError LIMIT_FILE_SIZE
  fileFilter: (req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) return cb(null, true);
    const err = new Error("Seuls les fichiers PNG et JPEG sont acceptés");
    err.status = 415;
    cb(err);
  },
});
