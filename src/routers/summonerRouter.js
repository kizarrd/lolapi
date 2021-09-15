import express from "express";
import { summoner } from "../controllers/summonerController";

const summonerRouter = express.Router();

summonerRouter.get("/:username", summoner);

export default summonerRouter;