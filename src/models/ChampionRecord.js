import mongoose from "mongoose";

const championRecordSchema = new mongoose.Schema({
    championId: Number,
    numOfGamesPlayed: Number,
    encounteredChampionsList: {
        type: Map,
        of: {
            id: Number,
            playedAgainst: Number,
            playedWith: Number,
            winAgainst: Number,
            winWith: Number,
            winRateAgainst: Number,
            winRateWith: Number
        }
    }
})

const ChampionRecord = mongoose.model("ChampionRecord", championRecordSchema);
export default ChampionRecord;