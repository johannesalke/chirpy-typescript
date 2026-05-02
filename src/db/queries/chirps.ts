import { UUID } from "node:crypto";
import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";
import { eq } from "drizzle-orm";


export async function createChirp(chirp: NewChirp) {
    const [result] = await db
        .insert(chirps)
        .values(chirp)
        .onConflictDoNothing()
        .returning();
    return result;
}

export async function getAllChirps(authorID?: string) {
    let result
    if (authorID != undefined && authorID != "") {
        result = await db
            .select()
            .from(chirps)
            .where(eq(chirps.userId, authorID))
            .orderBy(chirps.createdAt);
    } else {
        result = await db
            .select()
            .from(chirps)
            .orderBy(chirps.createdAt);
    }
    return result
}

export async function getChirpsByAuthor(authorID: string) {
    const result: NewChirp[] = await db
        .select()
        .from(chirps)
        .where(eq(chirps.userId, authorID))
        .orderBy(chirps.createdAt);
    return result
}

export async function getOneChirpByID(chirp_id: string) {
    const [result] = await db
        .select()
        .from(chirps)
        .where(eq(chirps.id, chirp_id));
    return result
}

export async function deleteChirp(chirp_id: string) {
    const [result] = await db
        .delete(chirps)
        .where(eq(chirps.id, chirp_id))
        .returning();
    return result
}