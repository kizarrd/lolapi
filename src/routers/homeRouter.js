import express from "express";
import { home, riotVerification } from "../controllers/homeController";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.get("/riot.txt", riotVerification);

export default rootRouter;