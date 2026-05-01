import { db } from "../index.js";
import { users } from "../schema.js";
export async function resetTables() {
    await db
        .delete(users);
    return true;
}
