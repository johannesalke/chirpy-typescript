import { db } from "../index.js";
import { chirps } from "../schema.js";
import { eq } from "drizzle-orm";
export async function createChirp(chirp) {
    const [result] = await db
        .insert(chirps)
        .values(chirp)
        .onConflictDoNothing()
        .returning();
    return result;
}
export async function getAllChirps(authorID) {
    let result;
    if (authorID != undefined && authorID != "") {
        result = await db
            .select()
            .from(chirps)
            .where(eq(chirps.userId, authorID))
            .orderBy(chirps.createdAt);
    }
    else {
        result = await db
            .select()
            .from(chirps)
            .orderBy(chirps.createdAt);
    }
    return result;
}
export async function getChirpsByAuthor(authorID) {
    const result = await db
        .select()
        .from(chirps)
        .where(eq(chirps.userId, authorID))
        .orderBy(chirps.createdAt);
    return result;
}
export async function getOneChirpByID(chirp_id) {
    const [result] = await db
        .select()
        .from(chirps)
        .where(eq(chirps.id, chirp_id));
    return result;
}
export async function deleteChirp(chirp_id) {
    const [result] = await db
        .delete(chirps)
        .where(eq(chirps.id, chirp_id))
        .returning();
    return result;
}
