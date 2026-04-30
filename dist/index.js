import express from "express";
import { config } from "./config.js";
const app = express();
const PORT = 8080;
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use(middlewareLogResponse);
app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerMetrics);
////////////////| Middleware |//////////////////
function middlewareLogResponse(req, res, next) {
    res.on("finish", () => {
        const stat = res.statusCode;
        if (stat >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${stat}`);
        }
    });
    next();
}
function middlewareMetricsInc(req, res, next) {
    config.fileserverHits++;
    next();
}
//////////////| Handler Functions |///////////////
function handlerReadiness(req, res) {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}
function handlerMetrics(req, res) {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(`Hits: ${config.fileserverHits}`);
}
function handlerReset(req, res) {
    config.fileserverHits = 0;
}
///////////////| Activate the Server |///////////////////
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
