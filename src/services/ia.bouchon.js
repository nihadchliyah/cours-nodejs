export async function repondre(question) {
  return {
    texte: `[bouchon] Vous avez demandé : ${question.slice(0, 60)}`,
    jetons: { input_tokens: 0, output_tokens: 0 },
  };
}

export async function* repondreEnFlux(question) {
  for (const mot of `[bouchon] Réponse simulée pour « ${question} ».`.split(" ")) {
    await new Promise((r) => setTimeout(r, 80));
    yield mot + " ";
  }
}
