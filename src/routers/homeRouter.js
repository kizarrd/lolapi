import express from "express";
import { home } from "../controllers/homeController";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.get("/riot.txt", (req, res) => {
    res.sendFile(__dirname+"/riot.txt");
});

export default rootRouter;