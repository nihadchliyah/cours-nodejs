import type { Request, Response } from "express";

interface Tache { id: number; titre: string; echeance?: Date }

const taches: Tache[] = [];

export function trouver(req: Request, res: Response) {
  const tache = taches.find((t) => t.id === req.params.id);
  res.json({ ...tache, joursRestants: (tache.echeance - new Date()) / 86400000 });
}
