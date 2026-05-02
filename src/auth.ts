import { hash, verify } from "argon2";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request } from "express";







export async function hashPassword(password: string): Promise<string> {
    await hash(password)
    return await hash(password)
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    //const hashedPassword = await hashPassword(password)
    // hashedPassword === hash
    return verify(hash, password)
}

type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;
export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    const now = Math.floor(Date.now() / 1000)
    const payload: Payload = { iss: "chirpy", sub: userID, iat: now, exp: now + expiresIn }
    const signedToken = jwt.sign(payload, secret)
    return signedToken


}

export function validateJWT(token: string, secret: string): string {

    const payload = jwt.verify(token, secret)
    return payload.sub as string

}

export function getBearerToken(req: Request): string {
    const authorization = req.get("Authorization")
    if (authorization == null) {
        throw new Error("no auth token")
    } else if (authorization.split(" ")[0] != "Bearer") {
        throw new Error("wrong auth type")
    }
    return authorization.split(" ")[1]
}

import { randomBytes } from "crypto";
export function makeRefreshToken(): string {
    return randomBytes(32).toString("hex")
}