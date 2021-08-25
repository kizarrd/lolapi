import fetch from "node-fetch";
import userMatchLists from "../../userMatchLists";
import championList from "../../championList";
import User from "../models/User";

class matchInfo {
    constructor(matchId, championId, timestamp){
        this.matchId = matchId;
        this.championId = championId;
        this.timestamp = timestamp;
    }
}
class encounteredChampion {
    constructor(championId){
        this.id = championId;
        this.playedAgainst = 0;
        this.playedWith = 0;
        this.winAgainst = 0;
        this.winWith = 0;
        this.winRateAgainst = 0;
        this.winRateWith = 0;
    }
}
class championRecord {
    constructor(championId){
        this.id = championId;
        this.numOfGamesPlayed = 1;
        this.encounteredChampionsList = [];
    }
}

const encryptedAccountId_SummitRoadId_25th_Aug = "hlYQ1KfOORXo1LaIx_G4IWilxgs9HgINJFNm1YiPE55n47E";
const puuid_SummitRoadId_25th_Aug = "ZB_ZPxnTnDmv0jSyfno98Ypo3kKR5wPcX0miZw1oM9XVJ2AtoPSz1zDWSU1djJpoG2uEwGvXmaUCtg";


const API_KEY = "RGAPI-3353a85e-adf8-4df6-81cc-33f0b30b6092";
const API_ROOT = "https://kr.api.riotgames.com/";
const SUMMONERS_BY_NAME = "lol/summoner/v4/summoners/by-name/";
const MATCHLISTS_BY_ACCOUNT = "lol/match/v4/matchlists/by-account/";
const MATCH_BY_MATCHID = "lol/match/v4/matches/";
const SUMMONER_NAME = "summit road";
let SUMMONER_ID_ENCRYPTED = ""; 
const championId = "4";

const getSummonerData = async (summonerName) => {
    const {
        accountId, puuid, name, summonerLevel, profileIconId
    } = await (await fetch(`${API_ROOT+SUMMONERS_BY_NAME+summonerName}?api_key=${API_KEY}`)).json();
    console.log(accountId);
    return { accountId, puuid, name, summonerLevel, profileIconId };
}

const getNumOfTotalGames = async ( encryptedId ) => {
    const {
        totalGames
    } = await (await fetch(`${API_ROOT+MATCHLISTS_BY_ACCOUNT+encryptedId}?endIndex=200&beginIndex=100&api_key=${API_KEY}`)).json();
    console.log("total games: ", totalGames);
    return totalGames;
}

const handleSearch = (error, users) => {
    console.log("errors", error);
    console.log("users", users);
};

export const home = async (req, res) => {
    const { accountId, puuid, name, summonerLevel, profileIconId }  = await getSummonerData(SUMMONER_NAME);
    console.log("accountIdEncrypted: ", accountId)
    const totalGames = await getNumOfTotalGames(accountId);
    let forRange = Math.ceil(totalGames/100);
    let matchlist = []; // (array of objects with matchId and championId)
    let beginIndex=0;
    let endIndex=100;


    // fetch all ranked matches played by the user, process those data to save ( gameId(matchId), champion(id), and timestamp )
    for(let i=0; i<1; i++) {
        let { matches: list } = await (await fetch(`${API_ROOT+MATCHLISTS_BY_ACCOUNT+accountId}?endIndex=${endIndex}&beginIndex=${beginIndex}&api_key=${API_KEY}`)).json();
        // console.log(list);
        for(var j=0; j<list.length; j++) {
            if([4, 6, 42, 410, 420, 440].includes(list[j].queue)){
                let instance = new matchInfo(list[j].gameId, list[j].champion, list[j].timestamp);
                matchlist.push(instance);
            }
        }
        console.log("matchlist length: ", matchlist.length);
        beginIndex+=100;
        endIndex+=100;
    }

    try {
        const user = new User({
            userName: name,
            encryptedAccountId: accountId,
            puuid: puuid,
            level: summonerLevel,
            avatarInfo: profileIconId,
            matchList: matchlist
        })
        console.log(user);
        await user.save();
        return res.render("home");
    } catch(error) {
        console.log(error);
        return res.send(`error: ${error}`);
    }

    // console.log("matchlist: ", matchlist);

    // for each match, update champion record data

    // if (vendors.some(e => e.Name === 'Magenic')) {
    //     /* vendors contains the element we're looking for */
    //   }

    // myArray.find(x => x.id === '45').foo;
    // let counter = 0;

    // let championRecordsList = [];

    // for(const match of matchlist){
    //     const matchData = await (await fetch(`${API_ROOT+MATCH_BY_MATCHID+match.matchId}?api_key=${API_KEY}`)).json();
    //     // console.log("matchData: ", matchData);
    //     let userTeamId = 0;
    //     let userWin = true;
    //     // find the team id, and win/lose of the player
    //     let winTeamId = 0;
    //     if(matchData.teams.find(team => team.teamId == 100).win == "Win"){
    //         winTeamId = 100;
    //     }else if(matchData.teams.find(team => team.teamId == 200).win == "Win"){
    //         winTeamId = 200;
    //     }
    //     for(const participant of matchData.participants){
    //         if(participant.championId == match.championId){
    //             userTeamId = participant.teamId;
    //             userWin = (userTeamId == winTeamId) ? true : false;
    //             break;
    //         }
    //     }

    //     if(!(championRecordsList.some(championRecord => championRecord.id == match.championId))){
    //         let instance1 = new championRecord(match.championId);
    //         championRecordsList.push(instance1);
    //     }else{
    //         championRecordsList.find(championRecord => championRecord.id == match.championId).numOfGamesPlayed += 1;
    //     }
    //     console.log("championRecordsList: ", championRecordsList);

    //     // update teammates and enemies records
    //     for(const participant of matchData.participants){
    //         if(participant.championId == match.championId){continue;}
    //         if(!(championRecordsList.find(championRecord => championRecord.id == match.championId).encounteredChampionsList.some(encounteredChampion => encounteredChampion.id === participant.championId))){
    //             let instance2 = new encounteredChampion(participant.championId); 
    //             championRecordsList.find(championRecord => championRecord.id == match.championId).encounteredChampionsList.push(instance2);
    //         }
    //         if(participant.teamId == userTeamId){
    //             championRecordsList.find(championRecord => championRecord.id == match.championId).encounteredChampionsList.find(encounteredChampion => encounteredChampion.id == participant.championId).playedWith += 1;
    //             if(userWin){
    //                 championRecordsList.find(championRecord => championRecord.id == match.championId).encounteredChampionsList.find(encounteredChampion => encounteredChampion.id == participant.championId).winWith += 1;
    //             }
    //         }else{
    //             championRecordsList.find(championRecord => championRecord.id == match.championId).encounteredChampionsList.find(encounteredChampion => encounteredChampion.id == participant.championId).playedAgainst += 1;
    //             if(userWin){
    //                 championRecordsList.find(championRecord => championRecord.id == match.championId).encounteredChampionsList.find(encounteredChampion => encounteredChampion.id == participant.championId).winAgainst += 1;
    //             }
    //         }
    //     }

    //     console.log("championRecordsList: ", championRecordsList);

    //     // console.log("matchId: ", matchData.gameId, typeof(matchData.gameId));
    //     // console.log("userTeamId: ", userTeamId, typeof(userTeamId));
    //     // console.log("userWin: ", userWin, typeof(userWin));

    //     counter++;
    //     if(counter>9) break;
    // };
    // console.log(championRecordsList.find(championRecord => championRecord.id == 4).encounteredChampionsList);
    
};

// const matchlist_by_champion = await (await fetch(`${API_ROOT+MATCHLISTS_BY_ACCOUNT+accountId}?champion=${championId}&api_key=${API_KEY}`)).json();

// const fs = require('fs');
// const jsonFile = fs.readFileSync('./champion.json', 'utf8');
// // console.log(jsonFile);
// const jsonData = JSON.parse(jsonFile);
// // console.log(jsonData);
// const championData = jsonData.data;
// var count = 0;
// for(var key in championData) {
//     console.log(championData[key].id);
//     count++;
// }
// console.log(count);
// championData.forEach(champion => {
//     console.log(champion.id);
// });