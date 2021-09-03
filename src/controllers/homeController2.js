import fetch from "node-fetch";
import userMatchLists from "../../userMatchLists";
import championList from "../../championList";
import User, { ChampionRecord } from "../models/User";

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
const encryptedAccountId_SummitRoadId_26th_Aug = 
"hlYQ1KfOORXo1LaIx_G4IWilxgs9HgINJFNm1YiPE55n47E";
const puuid_SummitRoadId_25th_Aug = "ZB_ZPxnTnDmv0jSyfno98Ypo3kKR5wPcX0miZw1oM9XVJ2AtoPSz1zDWSU1djJpoG2uEwGvXmaUCtg";


const API_KEY = "RGAPI-0b65bea2-f1cb-481e-880e-c85e9a9518a0";
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

const processData = async (existingUser) => {
    let counter = 0;
    for(const match of existingUser.matchList){
        const matchData = await (await fetch(`${API_ROOT+MATCH_BY_MATCHID+match.matchId}?api_key=${API_KEY}`)).json();
        // console.log("matchData: ", matchData);
        let userTeamId = 0;
        let userWin = true;
        // find the team id, and win/lose of the player
        let winTeamId = 0;
        if(matchData.teams.find(team => team.teamId == 100).win == "Win"){
            winTeamId = 100;
        }else if(matchData.teams.find(team => team.teamId == 200).win == "Win"){
            winTeamId = 200;
        }
        for(const participant of matchData.participants){
            if(participant.championId == match.championId){
                userTeamId = participant.teamId;
                userWin = (userTeamId == winTeamId) ? true : false;
                break;
            }
        }
        // if there's no championRecords for the champion played by the user in this match yet, then create one. else, increase the numOfGamesPlayed of the corresponding champion played by the user. 
        if(!existingUser.championRecords.has(match.championId.toString())){
            var stringId = match.championId.toString()
            const a_championRecord = new ChampionRecord({
                championId: match.championId,
                numOfGamesPlayed: 1
            })
            await a_championRecord.save();
            existingUser.championRecords.set(stringId, a_championRecord);
        }else{
            existingUser.championRecords.get(match.championId.toString()).numOfGamesPlayed += 1;
        }

        console.log("existingUser.championRecords.get(match.championId.toString()).encounteredChampionsList: ", existingUser.championRecords.get(match.championId.toString()).encounteredChampionsList);

        for(const participant of matchData.participants){
            if(participant.championId == match.championId){continue;}
            if(!existingUser.championRecords.get(match.championId.toString()).encounteredChampionsList.has(participant.championId.toString())){
                existingUser.championRecords.get(match.championId.toString()).encounteredChampionsList.set(participant.championId.toString(), {
                    id: participant.championId
                })
            }

            if(participant.teamId == userTeamId){
                existingUser.championRecords.get(match.championId.toString()).encounteredChampionsList.get(participant.championId.toString()).playedWidth += 1;
                if(userWin){
                    existingUser.championRecords.get(match.championId.toString()).encounteredChampionsList.get(participant.championId.toString()).winWith += 1;
                }
            }else{
                existingUser.championRecords.get(match.championId.toString()).encounteredChampionsList.get(participant.championId.toString()).playedAgainst += 1;
                if(userWin){
                    existingUser.championRecords.get(match.championId.toString()).encounteredChampionsList.get(participant.championId.toString()).winAgainst += 1;
                }
            }
        }
        existingUser.save()
        counter++;
        if(counter>9) break;
    }
    console.log(existingUser.championRecords.get('4').encounteredChampionsList);
};

export const home = async (req, res) => {

    let userAlreadyExists = await User.exists({userName: SUMMONER_NAME});
    if(userAlreadyExists){
        const existingUser = await User.findOne({ userName: SUMMONER_NAME });
        console.log("this user had been already searched before.");
        console.log(`name of the user: ${existingUser.userName}`);
        console.log(`# of matches recorded in db: ${existingUser.matchList.length}`);
        processData(existingUser);
        return res.render("home");
    }

    const { accountId, puuid, name, summonerLevel, profileIconId }  = await getSummonerData(SUMMONER_NAME);
    console.log("accountIdEncrypted: ", accountId)
    const totalGames = await getNumOfTotalGames(accountId);
    let forRange = Math.ceil(totalGames/100);
    let matchlist = []; // (array of objects with matchId and championId)
    let beginIndex=0;
    let endIndex=100;
    let lastMatchId = '';


    // fetch all ranked matches played by the user, process those data to save ( gameId(matchId), champion(id), and timestamp )
    for(let i=0; i<forRange; i++) {
        let { matches: list } = await (await fetch(`${API_ROOT+MATCHLISTS_BY_ACCOUNT+accountId}?endIndex=${endIndex}&beginIndex=${beginIndex}&api_key=${API_KEY}`)).json();
        // console.log(list);
        if(i==0){
            lastMatchId = list[0].gameId.toString()
        }
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
            puuid,
            level: summonerLevel,
            avatarInfo: profileIconId,
            lastMatchId,
            matchList: matchlist
        })
        console.log(user);
        await user.save();
        return res.render("home");
    } catch(error) {
        console.log(error);
        return res.send(`error: ${error}`);
    }
    
};