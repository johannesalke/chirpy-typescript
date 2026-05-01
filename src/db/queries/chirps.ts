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

export async function getAllChirps() {
    const result: NewChirp[] = await db
        .select()
        .from(chirps)
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