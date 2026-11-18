export function valider(schema) {
  return (req, res, next) => {
    const resultat = schema.safeParse(req.body ?? {});
    if (!resultat.success) {
      return res.status(400).json({
        erreur: "Données invalides",
        details: resultat.error.issues.map((i) => ({ champ: i.path.join("."), message: i.message })),
      });
    }
    req.valide = resultat.data;
    next();
  };
}
