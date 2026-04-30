import express from "express";
const app = express();
const PORT = 8080;
app.use("/app", express.static("./src/app"));
app.use(middlewareLogResponse);
app.get("/healthz", handlerReadiness);
function handlerReadiness(req, res) {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}
function middlewareLogResponse(req, res, next) {
    res.on("finish", () => {
        const stat = res.statusCode;
        if (stat >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${stat}`);
        }
    });
    next();
}
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
