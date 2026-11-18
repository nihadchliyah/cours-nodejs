import { Worker } from "node:worker_threads";

const fichierWorker = new URL("../workers/hachage.js", import.meta.url);

export function hacherDansWorker(motDePasse, cout = 14) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(fichierWorker, { workerData: { motDePasse, cout } });
    worker.once("message", resolve);
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) reject(new Error(`Le worker de hachage s'est arrêté (code ${code})`));
    });
  });
}
