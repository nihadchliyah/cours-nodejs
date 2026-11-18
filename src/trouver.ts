import type { Request, Response } from "express";

interface Tache { id: number; titre: string; echeance?: Date }

const taches: Tache[] = [];

export function trouver(req: Request, res: Response) {
  const tache = taches.find((t) => t.id === Number(req.params.id));
  if (!tache) {
    res.status(404).json({ erreur: "Tâche introuvable" });
    return;
  }
  const joursRestants = tache.echeance
    ? (tache.echeance.getTime() - Date.now()) / 86400000
    : null;
  res.json({ ...tache, joursRestants });
}
