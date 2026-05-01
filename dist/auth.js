import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
export async function hashPassword(password) {
    await hash(password);
    return await hash(password);
}
export async function checkPasswordHash(password, hash) {
    //const hashedPassword = await hashPassword(password)
    // hashedPassword === hash
    return verify(hash, password);
}
export function makeJWT(userID, expiresIn, secret) {
    const now = Math.floor(Date.now() / 1000);
    const payload = { iss: "chirpy", sub: userID, iat: now, exp: now + expiresIn };
    const signedToken = jwt.sign(payload, secret);
    return signedToken;
}
export function validateJWT(token, secret) {
    try {
        const payload = jwt.verify(token, secret);
        return payload.sub;
    }
    catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            throw new Error("expired token");
        }
        else {
            throw err;
        }
    }
}
export function getBearerToken(req) {
    const authorization = req.get("Authorization");
    if (authorization == null) {
        throw new Error("no auth token");
    }
    else if (authorization.split(" ")[0] != "Bearer") {
        throw new Error("wrong auth type");
    }
    return authorization.split(" ")[1];
}
