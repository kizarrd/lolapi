import express from "express";
import { summoner, summonerNoParam } from "../controllers/summonerControllerv5";

const summonerRouter = express.Router();

summonerRouter.get("/", summonerNoParam);
// summonerRouter.get("/:username", summoner);
summonerRouter.get("/:username", summoner);

export default summonerRouter;