import type { MigrationConfig } from "drizzle-orm/migrator";




process.loadEnvFile()

type APIConfig = {
    fileserverHits: number;
    platform: string;
    secret: string;
    polkaKey: string;
    db: {
        url: string;
        migrationConfig: MigrationConfig;
    }
}

const dbURL = envOrThrow("DB_URL")

const migrationConfig: MigrationConfig = {
    migrationsFolder: "./src/db/generated",
};


export const config: APIConfig = {
    fileserverHits: 0,
    platform: envOrThrow("PLATFORM"),
    secret: envOrThrow("SECRET"),
    polkaKey: envOrThrow("POLKA_KEY"),
    db: {
        url: dbURL,
        migrationConfig: migrationConfig
    }
}








///////////| Helper Functions |////////////////

function envOrThrow(key: string): string {
    const envVar = process.env[key]
    if (typeof envVar == "undefined") {
        throw new Error(`Required environmental variable ${key} is missing`)
    }
    return envVar
}