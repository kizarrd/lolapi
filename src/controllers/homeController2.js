import fetch from "node-fetch";
import userMatchLists from "../../userMatchLists";
import championList from "../../championList";
import User from "../models/User";
import ChampionRecord from "../models/ChampionRecord";
import mongoose from "mongoose";

export const home = async (req, res) => {
    const { username } = req.query;
    if(username){
        return res.redirect(`/summoners/${username}`);
    }
    return res.render("home");
};