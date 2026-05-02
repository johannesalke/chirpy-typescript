import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { refresh_tokens } from "../schema.js";
export async function createreRefreshToken(newToken) {
    const [result] = await db
        .insert(refresh_tokens)
        .values(newToken)
        .onConflictDoNothing()
        .returning();
    return result;
}
export async function getRefreshToken(token) {
    const [result] = await db
        .select()
        .from(refresh_tokens)
        .where(eq(refresh_tokens.token, token));
    return result;
}
export async function revokeRefreshToken(token) {
    const [result] = await db
        .update(refresh_tokens)
        .set({
        revokedAt: new Date()
    })
        .where(eq(refresh_tokens.token, token))
        .returning();
    return result;
}
