process.loadEnvFile();
const dbURL = envOrThrow("DB_URL");
const migrationConfig = {
    migrationsFolder: "./src/db/generated",
};
export const config = {
    fileserverHits: 0,
    platform: envOrThrow("PLATFORM"),
    secret: envOrThrow("SECRET"),
    db: {
        url: dbURL,
        migrationConfig: migrationConfig
    }
};
///////////| Helper Functions |////////////////
function envOrThrow(key) {
    const envVar = process.env[key];
    if (typeof envVar == "undefined") {
        throw new Error(`Required environmental variable ${key} is missing`);
    }
    return envVar;
}
