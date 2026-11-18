const estimerJetons = (texte) => Math.ceil(texte.length / 4);

export async function repondre(question) {
  const texte = `[bouchon] Vous avez demandé : ${question.slice(0, 60)}`;
  return { texte, jetons: { input_tokens: estimerJetons(question), output_tokens: estimerJetons(texte) } };
}

export async function* repondreEnFlux(question) {
  for (const mot of `[bouchon] Réponse simulée pour « ${question} ».`.split(" ")) {
    await new Promise((r) => setTimeout(r, 80));
    yield mot + " ";
  }
}
