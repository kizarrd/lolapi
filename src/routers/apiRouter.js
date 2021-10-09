import express from "express";
import { update } from "../controllers/summonerController";
import { update2 } from "../controllers/summonerControllerv5";

const apiRouter = express.Router();

apiRouter.post("/summoners/:username/update", update2);

export default apiRouter;