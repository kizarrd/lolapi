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
    },
    mostPlayedWith: String, // pug에서 map.get()안에 인자로 활용하기 위해서 String type으로 저장함. championrecord.pug참고
    mostPlayedAgainst: String,
    mostEncountered: String
})

const ChampionRecord = mongoose.model("ChampionRecord", championRecordSchema);
export default ChampionRecord;