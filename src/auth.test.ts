import { describe, it, expect, beforeAll } from "vitest";
import { checkPasswordHash, hashPassword, makeJWT, validateJWT } from "./auth.js";
import { TokenExpiredError } from "jsonwebtoken";

describe("Password Hashing", () => {
    const password1 = "correctPassword123!";
    const password2 = "anotherPassword456!";
    let hash1: string;
    let hash2: string;

    beforeAll(async () => {
        hash1 = await hashPassword(password1);
        hash2 = await hashPassword(password2);
    });

    it("should return true for the correct password", async () => {
        const result = await checkPasswordHash(password1, hash1);
        expect(result).toBe(true);
    });

    it("should return false for an incorrect password", async () => {
        const result = await checkPasswordHash(password1, hash2);
        expect(result).toBe(false);
    });
});

describe("JWT Tokens", () => {
    const password1 = "correctPassword123!";
    const password2 = "anotherPassword456!";
    let jwt1: string;
    let jwt2: string;
    const uid1 = "12345"
    const uid2 = "54321"

    beforeAll(async () => {
        jwt1 = makeJWT(uid1, 0, password1);
        jwt2 = makeJWT(uid2, 10000, password2);
    });

    it("token expiry", async () => {
        try {
            const result = validateJWT(jwt1, password1);
        } catch (err) {
            if (err instanceof Error) {
                expect(err.message).toBe("expired token");
            }
        }
    });

    it("valid token reception", async () => {
        const result = validateJWT(jwt2, password2);
        expect(result).toBe(uid2);
    });
});

