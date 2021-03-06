import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName: String,
    summonerId: String,
    encryptedAccountId: String,
    puuid: String,
    level: Number,
    avatarInfo: Number,
    soloRankTier: String,
    soloRankRank: String,
    soloRankLeaguePoints: Number,
    soloRankWins: Number,
    soloRankLoses: Number,
    lastUpdateTime: Number,
    // matchList: [
    //     {
    //         matchId: Number,
    //         championId: Number,
    //         timestamp: Number
    //     }
    // ],
    championRecordsBefore: {
        type: Map,
        of: { type: mongoose.Schema.Types.ObjectId, ref: "ChampionRecord"}
    },
    championRecords11: {
        type: Map,
        of: { type: mongoose.Schema.Types.ObjectId, ref: "ChampionRecord"}
    },
    championRecords12: {
        type: Map,
        of: { type: mongoose.Schema.Types.ObjectId, ref: "ChampionRecord"}
    }
})

const User = mongoose.model("User", userSchema);
export default User;