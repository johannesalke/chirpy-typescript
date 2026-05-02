import express, { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);









const app = express();
const PORT = 8080;

app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use(middlewareLogResponse)
app.use(express.json())
app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics)
app.post("/admin/reset", handlerReset)

app.post("/api/users", (req, res, next) => {
    Promise.resolve(handlerCreateUser(req, res)).catch(next);
});
app.put("/api/users", (req, res, next) => {
    Promise.resolve(handlerUpdateUser(req, res)).catch(next);
});
app.post("/api/login", (req, res, next) => {
    Promise.resolve(handlerLogin(req, res)).catch(next);
});
app.post("/api/refresh", (req, res, next) => {
    Promise.resolve(handlerRefresh(req, res)).catch(next);
});
app.post("/api/revoke", (req, res, next) => {
    Promise.resolve(handlerRevokeRefreshtoken(req, res)).catch(next);
});
app.post("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerCreateChirp(req, res)).catch(next);
});
app.get("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerGetAllChirps(req, res)).catch(next);
});
app.get("/api/chirps/:chirpId", (req, res, next) => {
    Promise.resolve(handlerGetOneChirps(req, res)).catch(next);
});








app.use(middlewareUncaughtErrors)



//////////////| Classes |////////////////////

class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
    }
}
class ForbiddenError extends Error {
    constructor(message: string) {
        super(message);
    }
}
class PermissionError extends Error {
    constructor(message: string) {
        super(message);
    }
}
class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
    }
}



////////////////| Middleware |//////////////////

function middlewareLogResponse(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        const stat = res.statusCode
        if (stat >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${stat}`)
        }
    })
    next()
}

function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits++
    next()
}

function middlewareUncaughtErrors(err: Error, req: Request, res: Response, next: NextFunction) {
    console.log(err.message)
    res.set("Content-Type", "application/json")
    if (err instanceof BadRequestError) {
        res.status(400)
        res.send(JSON.stringify({ "error": err.message }))
    } else if (err instanceof PermissionError) {
        res.status(401)
        res.send(JSON.stringify({ "error": err.message }))

    } else if (err instanceof ForbiddenError) {
        res.status(403)
        res.send(JSON.stringify({ "error": err.message }))

    } else if (err instanceof NotFoundError) {
        res.status(404)
        res.send(JSON.stringify({ "error": err.message }))
    } else {
        res.status(500)
        res.send(JSON.stringify({ "error": "Something went wrong on our end" }))
    }
}


//////////////| Handler Functions |///////////////

import { createUser, getUserByEmail, updateUser } from "./db/queries/users.js";
import { NewChirp, NewRefreshToken, NewUser } from "./db/schema.js";
import { UUID } from "node:crypto";
import { createChirp, getAllChirps, getOneChirpByID } from "./db/queries/chirps.js";

async function handlerReadiness(req: Request, res: Response) {
    res.set("Content-Type", "text/plain; charset=utf-8")
    res.send("OK")

}

async function handlerMetrics(req: Request, res: Response) {
    res.set("Content-Type", "text/html; charset=utf-8")
    res.send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html>`
    )
}

import { resetTables } from "./db/queries/reset.js";
import { checkPasswordHash, getBearerToken, hashPassword, makeJWT, makeRefreshToken, validateJWT } from "./auth.js";
import { createreRefreshToken, getRefreshToken, revokeRefreshToken } from "./db/queries/refresh_tokens.js";
async function handlerReset(req: Request, res: Response) {
    if (config.platform != "dev") {
        throw new ForbiddenError("This action is only permitted in a development environment")
    }
    config.fileserverHits = 0
    const success = await resetTables()
    if (!success) {
        throw new Error("Unknown error while deleting DB contents")
    }

    res.set("Content-Type", "text/plain; charset=utf-8")
    res.send(`Reset Successfull\n`)
}


async function handlerCreateUser(req: Request, res: Response) {
    const body = req.body
    let newUser: NewUser
    const hash = await hashPassword(body.password)
    console.log(hash)
    try {
        newUser = { email: body.email, hashedPassword: hash }
        console.log(newUser)
    } catch {
        throw new BadRequestError("Request didn't conform to required shape.")
    }

    let result = await createUser(newUser)
    if (typeof result == "undefined") {
        throw new Error("This user already exists")
    }
    //console.log(result)
    respondWithJson(res, 201, result)

}

async function handlerLogin(req: Request, res: Response) {
    const body = req.body
    if (body.expiresInSeconds === undefined || body.expiresInSeconds >= 3600) {
        body.expiresInSeconds = 3600
    }
    const user = await getUserByEmail(body.email)
    const valid = await checkPasswordHash(body.password, user.hashedPassword)
    const jwt = makeJWT(user.id, body.expiresInSeconds, config.secret)
    const refreshToken = makeRefreshToken()
    if (valid) {
        //user as object
        user.hashedPassword = "no"
        //try {
        const refreshTokenObj: NewRefreshToken = { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 5184000000) }
        const tokenConfirm = await createreRefreshToken(refreshTokenObj)
        console.log(tokenConfirm)
        /*} catch (err) {
            console.error("refresh token insert failed:", err);
            throw err;
        }*/
        respondWithJson(res, 200, { ...user, token: jwt, refreshToken: tokenConfirm.token })
    } else {
        throw new PermissionError("incorrect email or password")
    }
}

async function handlerRefresh(req: Request, res: Response) {
    console.log("=== refresh handler called ===");
    const refreshToken = getBearerToken(req);
    console.log("bearer:", refreshToken);
    const token = await getRefreshToken(refreshToken);
    console.log("token from DB:", token);

    if (!token) {
        throw new PermissionError("No such refreshToken known")
        //return respondWithJson(res, 401, { error: "No such refreshToken known" })
    }
    if (token.revokedAt !== null) {
        throw new PermissionError("Token has been revoked")
        //return respondWithJson(res, 401, { error: "Token has been revoked" })
    }
    if (token.expiresAt.getTime() <= new Date(Date.now()).getTime()) {
        throw new PermissionError("Token has expired")
        //return respondWithJson(res, 401, { error: "Token has expired" })
    }
    try {
        const jwt = makeJWT(token.userId, 3600, config.secret)
        console.log("about to respond 200");
        respondWithJson(res, 200, { token: jwt })
        console.log("responded 200");
    } catch (err) {
        throw err
    }

}

async function handlerUpdateUser(req: Request, res: Response) {
    let userId
    try {
        const jwt = getBearerToken(req)


        userId = validateJWT(jwt, config.secret)
    } catch (err) {
        throw new PermissionError("Token malformed or missing")
    }
    const parameters = req.body
    const hash = await hashPassword(parameters.password)
    const newUserInfo = await updateUser(userId, parameters.email, hash)
    newUserInfo.hashedPassword = ""
    return respondWithJson(res, 200, newUserInfo)
}



async function handlerRevokeRefreshtoken(req: Request, res: Response) {
    //const params = req.body
    const refreshToken = getBearerToken(req)
    const token = await revokeRefreshToken(refreshToken)
    console.log("Revoked roken?:", token)
    res.sendStatus(204)

}


async function handlerCreateChirp(req: Request, res: Response) {
    //type Chirp = { body: string, userId: UUID }
    const jwt: string = getBearerToken(req)
    let user_id: string
    try {
        user_id = validateJWT(jwt, config.secret)
        //const user = getUserByEmail(user_id)
    } catch (err) {
        console.log(err)
        throw new PermissionError("Invalid or Expired Token")
    }


    const chirp: NewChirp = { body: req.body.body, userId: user_id }
    if (chirp.body.length > 140) {
        //res.status(400).send(JSON.stringify({ "error": "Chirp is too long" }));
        throw new BadRequestError("Chirp is too long. Max length is 140")
        return
    }
    const banned = ["kerfuffle", "sharbert", "fornax"];
    const words = chirp.body.split(" ");

    for (let i = 0; i < words.length; i++) {
        if (banned.includes(words[i].toLowerCase())) {
            words[i] = "****";
        }
    }
    const cleaned = words.join(" ");
    chirp.body = cleaned
    //console.log(chirp)

    const result = await createChirp(chirp)

    respondWithJson(res, 201, result)
    return

}

async function handlerGetAllChirps(req: Request, res: Response) {
    const chirps = await getAllChirps()
    console.log(chirps)
    respondWithJson(res, 200, chirps)
}

async function handlerGetOneChirps(req: Request, res: Response) {
    console.log(req.params)
    let chirp_id = req.params["chirpId"] as string

    const chirp = await getOneChirpByID(chirp_id)
    if (!chirp) {
        throw new NotFoundError("No such chirp")
    }
    respondWithJson(res, 200, chirp)

}

async function handlerDeleteChirp(req: Request, res: Response) {

}

////////////////| Helper FUnctions |/////////////

function respondWithJson(res: Response, statuscode: number, body: object) {
    res.status(statuscode)
    res.set("Content-Type", "application/json")
    res.send(JSON.stringify(body))
    return
}











///////////////| Activate the Server |///////////////////

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
