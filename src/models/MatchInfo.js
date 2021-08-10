import mongoose from "mongoose";

const matchInfoSchema = new mongoose.Schema({
    matchId: Number,
    championId: Number,
    timestamp: Number
})

const MatchInfo = mongoose.model("MatchInfo", matchInfoSchema);
export default MatchInfo;