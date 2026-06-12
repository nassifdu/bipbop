import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "bipbop_admin";
const secret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET ?? "bipbop-dev-secret-change-me"
  );

export async function signAdminToken() {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(await secret());
}

export async function verifyAdminToken(token: string) {
  try {
    await jwtVerify(token, await secret());
    return true;
  } catch {
    return false;
  }
}

export async function getAdminCookie() {
  const jar = await cookies();
  return jar.get(COOKIE)?.value ?? null;
}

export async function isAdmin() {
  const token = await getAdminCookie();
  if (!token) return false;
  return verifyAdminToken(token);
}

export { COOKIE };
