import express from "express";

const summonerRouter = express.Router();

const user = (req, res) => res.send("User Stat");

summonerRouter.get("/", user);

export default summonerRouter;