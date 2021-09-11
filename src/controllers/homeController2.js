import fetch from "node-fetch";
import userMatchLists from "../../userMatchLists";
import championList from "../../championList";
import User from "../models/User";
import ChampionRecord from "../models/ChampionRecord";
import mongoose from "mongoose";
class matchInfo {
    constructor(matchId, championId, timestamp){
        this.matchId = matchId;
        this.championId = championId;
        this.timestamp = timestamp;
    }
}

const encryptedAccountId_SummitRoadId_25th_Aug = "hlYQ1KfOORXo1LaIx_G4IWilxgs9HgINJFNm1YiPE55n47E";
const encryptedAccountId_SummitRoadId_26th_Aug = 
"hlYQ1KfOORXo1LaIx_G4IWilxgs9HgINJFNm1YiPE55n47E";
const puuid_SummitRoadId_25th_Aug = "ZB_ZPxnTnDmv0jSyfno98Ypo3kKR5wPcX0miZw1oM9XVJ2AtoPSz1zDWSU1djJpoG2uEwGvXmaUCtg";


const API_KEY = "RGAPI-c149f653-5ba6-44d0-bb10-d49c36ee3a6e";
const API_ROOT = "https://kr.api.riotgames.com/";
const SUMMONERS_BY_NAME = "lol/summoner/v4/summoners/by-name/";
const RANK_INFO_BY_SUMMONERID = "lol/league/v4/entries/by-summoner/";
const MATCHLISTS_BY_ACCOUNT = "lol/match/v4/matchlists/by-account/";
const MATCH_BY_MATCHID = "lol/match/v4/matches/";
const SUMMONER_NAME = "summit road";
let SUMMONER_ID_ENCRYPTED = ""; 
const championId = "4";

const getSummonerData = async (summonerName) => {
    // const {
    //     accountId, puuid, name, summonerLevel, profileIconId
    // } = await (await fetch(`${API_ROOT+SUMMONERS_BY_NAME+summonerName}?api_key=${API_KEY}`)).json();
    // console.log(accountId);
    // return { accountId, puuid, name, summonerLevel, profileIconId };
    const summonerData = await (await fetch(`${API_ROOT+SUMMONERS_BY_NAME+summonerName}?api_key=${API_KEY}`)).json();

    if(summonerData.status){
        return summonerData;
    }else{
        const {
            id: summonerId, accountId, puuid, name, summonerLevel, profileIconId
        } = summonerData;
        console.log(accountId);
        return { summonerId, accountId, puuid, name, summonerLevel, profileIconId };
    }
};

const getSummonerRankInfo = async (summonerId) => {
    const summonerRankDataList = await (await fetch(`${API_ROOT+RANK_INFO_BY_SUMMONERID+summonerId}?api_key=${API_KEY}`)).json();
    let summonerRankData = 0;
    for(const summonerRankInfo of summonerRankDataList){
        if(summonerRankInfo.queueType == "RANKED_SOLO_5x5"){
            summonerRankData = summonerRankInfo;
            break;
        }
    }
    return summonerRankData;
};

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

const processWinrate = async(existingUser) => {
    for(const champRecordId of existingUser.championRecords.values()){
        const champRecord = await ChampionRecord.findById(champRecordId);
        for(const encounteredChamp of champRecord.encounteredChampionsList.values()){
            if(encounteredChamp.playedWith>0){
                encounteredChamp.winRateWith = encounteredChamp.winWith / encounteredChamp.playedWith;
            }
            if(encounteredChamp.playedAgainst>0){
                encounteredChamp.winRateAgainst = encounteredChamp.winAgainst / encounteredChamp.playedAgainst;
            }            
        }
        await champRecord.save();
    }
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
                numOfGamesPlayed: 1,
                encounteredChampionsList: {}
            })
            await a_championRecord.save();
            existingUser.championRecords.set(stringId, a_championRecord._id);
        }else{
            existingUser.championRecords.get(match.championId.toString()).numOfGamesPlayed += 1;
        }

        console.log("existingUser.championRecords.get(match.championId.toString()).encounteredChampionsList: ", existingUser.championRecords.get(match.championId.toString()));

        const championRecord_objectId = existingUser.championRecords.get(match.championId.toString());

        const a_championRecord = await ChampionRecord.findById(championRecord_objectId);

        for(const participant of matchData.participants){
            if(participant.championId == match.championId){continue;}
            if(!a_championRecord.encounteredChampionsList.has(participant.championId.toString())){
                // console.log(`champion ${match.championId} has encountered champion ${participant.championId} for the first time!`);
                a_championRecord.encounteredChampionsList.set(participant.championId.toString(), {
                    id: participant.championId,
                    playedAgainst: 0,
                    playedWith: 0,
                    winAgainst: 0,
                    winWith: 0,
                    winRateAgainst: 0,
                    winRateWith: 0
                })
                // console.log("championRecord after the first encounter: ", a_championRecord);
            }

            if(participant.teamId == userTeamId){
                a_championRecord.encounteredChampionsList.get(participant.championId.toString()).playedWith += 1;
                if(userWin){
                    a_championRecord.encounteredChampionsList.get(participant.championId.toString()).winWith += 1;
                }
            }else{
                a_championRecord.encounteredChampionsList.get(participant.championId.toString()).playedAgainst += 1;
                if(userWin){
                    a_championRecord.encounteredChampionsList.get(participant.championId.toString()).winAgainst += 1;
                }
            }
        }
        counter++;
        if(counter>9) break;
        await a_championRecord.save();
    }

    // compute winrates 
    processWinrate(existingUser);

    await existingUser.save();
};

export const home = async (req, res) => {

    const { username } = req.query;
    if(username){
        // check if this is a valid summoner name
        const summoner = await getSummonerData(username);
        const { status } = summoner;
        // if a summoner with the searched name does not exist:
        if(status){
            console.log("summoner not found, not a valid name")
            console.log(status);
            return res.render("home");
        }
        // else if the summoner exists:
        const { summonerId , accountId, puuid, name, summonerLevel, profileIconId } = summoner;
        const { soloRankTier, soloRankRank, soloRankLeaguePoints, soloRankWins, soloRankLoses } = await getSummonerRankInfo(summonerId);
        let userAlreadyExists = await User.exists({userName: name});
        if(userAlreadyExists){
            const existingUser = await User.findOne({ userName: name });
            console.log("this user had been already searched before.");
            console.log(`name of the user: ${existingUser.userName}`);
            console.log(`# of matches recorded in db: ${existingUser.matchList.length}`);
            return res.render("home", { summoner });
        }
    
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
                summonerId,
                encryptedAccountId: accountId,
                puuid,
                level: summonerLevel,
                avatarInfo: profileIconId,
                soloRankTier, 
                soloRankRank, 
                soloRankLeaguePoints, 
                soloRankWins, 
                soloRankLoses,
                lastMatchId,
                matchList: matchlist,
                championRecords: {}
            })
            console.log(user);
            await user.save();
            processData(user);
            return res.render("home", { summoner });
        } catch(error) {
            console.log(error);
            return res.send(`error: ${error}`);
        }
    }else{
        return res.render("home");
    }

    
};