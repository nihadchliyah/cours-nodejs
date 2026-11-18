import { SignJWT, jwtVerify } from "jose";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET manquant dans .env");
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export function creerJeton(utilisateur) {
  return new SignJWT({ email: utilisateur.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(utilisateur.id))
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

export async function verifierJeton(jeton) {
  const { payload } = await jwtVerify(jeton, secret, { algorithms: ["HS256"] });
  return payload;
}
