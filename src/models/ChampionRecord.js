import mongoose from "mongoose";

const championRecordSchema = new mongoose.Schema({
    championId: Number,
    numOfTimesPlayed: Number,
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

export default championRecordSchema;

// const ChampionRecord = mongoose.model("ChampionRecord", championRecordSchema);
// export default ChampionRecord;