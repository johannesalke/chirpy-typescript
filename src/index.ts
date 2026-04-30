import express, { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import { nextTick } from "node:process";


const app = express();
const PORT = 8080;

app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use(middlewareLogResponse)
app.use(express.json())
app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics)
app.post("/admin/reset", handlerReset)
app.post("/api/validate_chirp", (req, res, next) => {
    Promise.resolve(handlerValidateChirp(req, res)).catch(next);
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
    } else {
        res.status(500)
        res.send(JSON.stringify({ "error": "Something went wrong on our end" }))
    }
}


//////////////| Handler Functions |///////////////

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

async function handlerReset(req: Request, res: Response) {
    config.fileserverHits = 0
    res.set("Content-Type", "text/plain; charset=utf-8")
    res.send(`Metrics Reset\n`)
}

async function handlerValidateChirp(req: Request, res: Response) {
    type Chirp = { body: string }



    res.set("Content-Type", "application/json; charset=utf-8")
    //try {
    const chirp: Chirp = req.body //JSON.parse(body);
    if (chirp.body.length > 140) {
        //res.status(400).send(JSON.stringify({ "error": "Chirp is too long" }));
        throw new BadRequestError("Chirp is too long. Max length is 140")
    }

    const banned = ["kerfuffle", "sharbert", "fornax"];
    const words = chirp.body.split(" ");

    for (let i = 0; i < words.length; i++) {
        if (banned.includes(words[i].toLowerCase())) {
            words[i] = "****";
        }
    }

    const cleaned = words.join(" ");

    res.status(200).send(JSON.stringify({ "cleanedBody": cleaned }))
    /*} catch (err) {
        next(err);
        //res.status(400).send(JSON.stringify({ "error": "Something went wrong" }));
    }*/

}





///////////////| Activate the Server |///////////////////

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
