import express from "express";
import { home } from "../controllers/homeController";
// import path from "path";

const rootRouter = express.Router();

rootRouter.get("/", home);
// rootRouter.get("/riot.txt", (req, res) => {
//     res.sendFile(path.join(__dirname, "../../riot", "riot.txt"));
// });

export default rootRouter;