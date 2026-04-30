import express, { NextFunction, Request, Response } from "express";
import { config } from "./config.js";


const app = express();
const PORT = 8080;

app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use(middlewareLogResponse)
app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerMetrics)


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


//////////////| Handler Functions |///////////////

function handlerReadiness(req: Request, res: Response) {
    res.set("Content-Type", "text/plain; charset=utf-8")
    res.send("OK")

}

function handlerMetrics(req: Request, res: Response) {
    res.set("Content-Type", "text/plain; charset=utf-8")
    res.send(`Hits: ${config.fileserverHits}`)
}

function handlerReset(req: Request, res: Response) {
    config.fileserverHits = 0
}






///////////////| Activate the Server |///////////////////

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
