import express from "express";
import { home } from "../controllers/homeController2";

const rootRouter = express.Router();

rootRouter.get("/", home);

export default rootRouter;