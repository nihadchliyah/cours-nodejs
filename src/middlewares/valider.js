// Middleware de validation Zod réutilisable.
// valider(schema)          → valide req.body
// valider(schema, "query") → valide req.query
// Le résultat nettoyé (valeurs par défaut, conversions) est rangé dans req.valide[source] :
// en Express 5, req.query est en lecture seule, on ne peut pas le remplacer.
export function valider(schema, source = "body") {
  return (req, res, next) => {
    const resultat = schema.safeParse(req[source] ?? {});
    if (!resultat.success) {
      return res.status(400).json({
        erreur: "Données invalides",
        details: resultat.error.issues.map((i) => ({ champ: i.path.join("."), message: i.message })),
      });
    }
    req.valide ??= {};
    req.valide[source] = resultat.data;
    next();
  };
}
