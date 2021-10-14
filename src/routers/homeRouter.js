import express from "express";
import { home } from "../controllers/homeController";

const rootRouter = express.Router();

rootRouter.get("/", home);

export default rootRouter;