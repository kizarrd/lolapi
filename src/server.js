import express from "express";
import morgan from "morgan";
import homeRouter from "./routers/homeRouter";
import summonerRouter from "./routers/summonerRouter";
import apiRouter from "./routers/apiRouter";
import "./db";
import "./models/MatchInfo";
import "regenerator-runtime";

const app = express();

app.set("view engine", "pug");
app.set("views", process.cwd()+"/src/views");

app.use(morgan('dev'));
// app.use(express.urlencoded({extended: true}));

app.use("/assets", express.static("assets"));
app.use("/tiers", express.static("tiers"));
// app.use("/riot", express.static("riot"));
app.use('/riot.txt', express.static('riot.txt'));

app.use("/", homeRouter);
app.use("/summoners", summonerRouter);
app.use("/api", apiRouter);

export default app;

