import express from "express";
import { update } from "../controllers/summonerController";

const apiRouter = express.Router();

apiRouter.post("/summoners/:username/update", update);

export default apiRouter;