import cluster from "node:cluster";
import { availableParallelism } from "node:os";

if (cluster.isPrimary) {
  const nombre = Number(process.env.WORKERS ?? availableParallelism());
  console.log(`Processus principal ${process.pid} : ${nombre} workers`);
  for (let i = 0; i < nombre; i++) cluster.fork();

  cluster.on("exit", (worker, code) => {
    if (worker.exitedAfterDisconnect) return;
    console.log(`Worker ${worker.process.pid} arrêté (code ${code}), relance`);
    cluster.fork();
  });
} else {
  await import("./index.js");
}
