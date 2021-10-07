import express from "express";
import { summoner } from "../controllers/summonerController";
import { summoner2, summonerNoParam } from "../controllers/summonerControllerv5";

const summonerRouter = express.Router();

summonerRouter.get("/", summonerNoParam);
// summonerRouter.get("/:username", summoner);
summonerRouter.get("/:username", summoner2);

export default summonerRouter;