import express from "express";
import { update } from "../controllers/summonerControllerv5";

const apiRouter = express.Router();

apiRouter.post("/summoners/:username/update", update);

export default apiRouter;