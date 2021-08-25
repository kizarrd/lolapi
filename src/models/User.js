import mongoose from "mongoose";

const championRecordSchema = new mongoose.Schema({
    championId: Number,
    numOfTimesPlayed: Number,
    encounteredChampionsList: [
        {
            id: Number,
            playedAgainst: Number,
            playedWith: Number, 
            winAgainst: Number, 
            winWith: Number, 
            winRateAgainst: Number,
            winRateWith: Number
        }
    ]
})

const userSchema = new mongoose.Schema({
    userName: String,
    encryptedAccountId: String,
    puuid: String,
    level: Number,
    avatarInfo: Number,
    matchList: [
        {
            matchId: Number,
            championId: Number,
            timestamp: Number
        }
    ],
    championRecords: [championRecordSchema]
})

const User = mongoose.model("User", userSchema);
export default User;

// 3. get encrypted account id from username
//     - create and save User model data ( 
//         username, encrypted account id, level, avatar info, 
//         matchlist array(
//             => normal js array of objects, and the object contains matchId, championId, and timestamp), 
//             championRecords array(
//                 => array of subdocuments/childrenSchemas the subdocument called championRecord will contain championId, numOfTimesPlayed, and encounteredChampionsList(
//                     which is again, an array of object, encounteredChampion, which will contain id, playedAgainst, playedWith, winAgainst, winWith, winRateAgainst, and winRateWith 
//             ) 
//         ) and etc.