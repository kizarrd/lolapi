import fetch from "node-fetch";
import userMatchLists from "../../userMatchLists";
import championList from "../../championList";

class matchInfo {
    constructor(matchId, championId, timestamp){
        this.matchId = matchId;
        this.championId = championId;
        this.timestamp = timestamp;
    }
}

class encounteredChampion {
    constructor(){
        
    }
}

const API_KEY = "RGAPI-1ee6e8f2-bbe6-4a33-ade9-0e992b4b2d20";
const API_ROOT = "https://kr.api.riotgames.com/";
const SUMMONERS_BY_NAME = "lol/summoner/v4/summoners/by-name/";
const MATCHLISTS_BY_ACCOUNT = "lol/match/v4/matchlists/by-account/";
const MATCH_BY_MATCHID = "lol/match/v4/matches/";
const SUMMONER_NAME = "summit road";
let SUMMONER_ID_ENCRYPTED = ""; 
const championId = "4";

const getEncryptedSummonerId = async () => {
    const {
        accountId
    } = await (await fetch(`${API_ROOT+SUMMONERS_BY_NAME+SUMMONER_NAME}?api_key=${API_KEY}`)).json();
    console.log(accountId);
    return accountId;
}

const getNumOfTotalGames = async ( encryptedId ) => {
    const {
        totalGames
    } = await (await fetch(`${API_ROOT+MATCHLISTS_BY_ACCOUNT+encryptedId}?endIndex=200&beginIndex=100&api_key=${API_KEY}`)).json();
    console.log("total games: ", totalGames);
    
    return totalGames;
}

export const home = async (req, res) => {
    const SUMMONER_ID_ENCRYPTED = await getEncryptedSummonerId();
    const totalGames = await getNumOfTotalGames(SUMMONER_ID_ENCRYPTED);
    let forRange = Math.ceil(totalGames/100);
    let matchlist = []; // (array of objects with matchId and championId)
    let beginIndex=0;
    let endIndex=100;
    // fetch all ranked matches played by the user, process those data to save ( gameId(matchId), champion(id), and timestamp )
    for(let i=0; i<forRange; i++) {
        let { matches: list } = await (await fetch(`${API_ROOT+MATCHLISTS_BY_ACCOUNT+SUMMONER_ID_ENCRYPTED}?endIndex=${endIndex}&beginIndex=${beginIndex}&api_key=${API_KEY}`)).json();
        // console.log(list);
        for(var key in list) {
            if([4, 6, 42, 410, 420, 440].includes(list[key].queue)){
                var instance = new matchInfo(list [key].gameId, list[key].champion, list[key].timestamp);
                matchlist.push(instance);
            }
        }
        console.log(matchlist.length);
        beginIndex+=100;
        endIndex+=100;
    }
    console.log(matchlist);

    // for each match, update champion record data

    let counter = 0;

    for(const match of matchlist){
        const matchData = await (await fetch(`${API_ROOT+MATCH_BY_MATCHID+match.matchId}?api_key=${API_KEY}`)).json();

        console.log(matchData);

        counter++;
        if(counter>9) break;
    };

    res.render("home");
};

// const matchlist_by_champion = await (await fetch(`${API_ROOT+MATCHLISTS_BY_ACCOUNT+SUMMONER_ID_ENCRYPTED}?champion=${championId}&api_key=${API_KEY}`)).json();

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