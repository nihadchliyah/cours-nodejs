import { parentPort, workerData } from "node:worker_threads";
import bcrypt from "bcrypt";

const { motDePasse, cout } = workerData;
parentPort.postMessage(bcrypt.hashSync(motDePasse, cout));
