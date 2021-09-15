import fetch from "node-fetch";
import userMatchLists from "../../userMatchLists";
import championList from "../../championList";
import User from "../models/User";
import ChampionRecord from "../models/ChampionRecord";
import mongoose from "mongoose";
import qs from "querystring";

class matchInfo {
    constructor(matchId, championId, timestamp){
        this.matchId = matchId;
        this.championId = championId;
        this.timestamp = timestamp;
    }
}

const API_KEY = "RGAPI-944dfee2-30fc-4126-8f0a-e53c1408aac2";
const API_ROOT = "https://kr.api.riotgames.com/";
const SUMMONERS_BY_NAME = "lol/summoner/v4/summoners/by-name/";
const RANK_INFO_BY_SUMMONERID = "lol/league/v4/entries/by-summoner/";
const MATCHLISTS_BY_ACCOUNT = "lol/match/v4/matchlists/by-account/";
const MATCH_BY_MATCHID = "lol/match/v4/matches/";

const getSummonerData = async (summonerName) => {
    const encodedSummonerName = qs.escape(summonerName)
    const summonerData = await (await fetch(`${API_ROOT+SUMMONERS_BY_NAME+encodedSummonerName}?api_key=${API_KEY}`)).json();
    return summonerData;
};
const getSummonerRankInfo = async (summonerId) => {
    const summonerRankDataList = await (await fetch(`${API_ROOT+RANK_INFO_BY_SUMMONERID+summonerId}?api_key=${API_KEY}`)).json();
    let summonerRankData = {
        soloTier: 0,
        soloRank: 0,
        soloLeaguePoints: 0,
        soloWins: 0,
        soloLosses: 0,
        flexTier: 0,
        flexRank: 0,
        flexLeaguePoints: 0,
        flexWins: 0,
        flexLosses: 0
    }
    for(const summonerRankInfo of summonerRankDataList){
        if(summonerRankInfo.queueType == "RANKED_SOLO_5x5"){
            summonerRankData.soloTier = summonerRankInfo.tier;
            summonerRankData.soloRank = summonerRankInfo.rank;
            summonerRankData.soloLeaguePoints = summonerRankInfo.leaguePoints;
            summonerRankData.soloWins = summonerRankInfo.wins;
            summonerRankData.soloLosses = summonerRankInfo.losses;
            if(summonerRankInfo.rank == 'I'){
                summonerRankData.soloRank = 1;
            }else if(summonerRankData.soloRank == 'II'){
                summonerRankData.soloRank = 2;
            }else if(summonerRankData.soloRank == 'III'){
                summonerRankData.soloRank = 3;
            }else if(summonerRankData.soloRank == 'IV'){
                summonerRankData.soloRank = 4;
            }else{
                summonerRankData.soloRank = 0;
            }
        }else if(summonerRankInfo.queueType == "RANKED_FLEX_SR"){
            summonerRankData.flexTier = summonerRankInfo.tier;
            summonerRankData.flexRank = summonerRankInfo.rank;
            summonerRankData.flexLeaguePoints = summonerRankInfo.leaguePoints;
            summonerRankData.flexWins = summonerRankInfo.wins;
            summonerRankData.flexLosses = summonerRankInfo.losses;
            if(summonerRankInfo.rank == 'I'){
                summonerRankData.flexRank = 1;
            }else if(summonerRankData.flexRank == 'II'){
                summonerRankData.flexRank = 2;
            }else if(summonerRankData.flexRank == 'III'){
                summonerRankData.flexRank = 3;
            }else if(summonerRankData.flexRank == 'IV'){
                summonerRankData.flexRank = 4;
            }else {
                summonerRankData.flexRank = 0;
            }
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
        // find the team id, and win/lose of the player of this match
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
                numOfGamesPlayed: 0,
                encounteredChampionsList: {}
            })
            await a_championRecord.save();
            existingUser.championRecords.set(stringId, a_championRecord._id);
        }

        const championRecord_objectId = existingUser.championRecords.get(match.championId.toString());
        const a_championRecord = await ChampionRecord.findById(championRecord_objectId);
        a_championRecord.numOfGamesPlayed += 1;
        console.log("numOfGamesPlayed", a_championRecord.numOfGamesPlayed);


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
        await a_championRecord.save();
        counter++;
        if(counter>9) break;
    }
    // compute winrates 
    processWinrate(existingUser);
    await existingUser.save();
};

export const summoner = async (req, res) => {
    const { username } = req.params;
    if(username){
        console.log(username)
        // check if this is a valid summoner name
        const summoner = await getSummonerData(username);
        const { status } = summoner;
        // if a summoner with the searched name does not exist:
        if(status){
            console.log("summoner not found, not a valid name");
            console.log(status);
            return res.redirect("/"); // 이거 재처리 해야 하나? 어떤 페이지로 보낼지.. 아니면 undefined되었다는 summoner object를 summoner와 함께 보낼지.
        }
        // else if the summoner exists:
        const { id: summonerId , accountId, puuid, name, summonerLevel, profileIconId } = summoner;
        const summonerRankInfo = await getSummonerRankInfo(summonerId);
        console.log("soloRankTier: ", summonerRankInfo.soloTier);

        let userAlreadyExists = await User.exists({userName: name});
        if(userAlreadyExists){
            const existingUser = await User.findOne({ userName: name }).populate("championRecords");
            console.log("this user had been already searched before.");
            console.log(`name of the user: ${existingUser.userName}`);
            console.log(`# of matches recorded in db: ${existingUser.matchList.length}`);
            let champion_records = existingUser.championRecords;
            const championNameById = {
                4: "Twisted Fate",
                112: "Viktor",
                875: "Sett",
                55: "Katarina",
                54: "Malphite",
                268: "Azir"
            };
            return res.render("summoner", { summoner, summonerRankInfo, champion_records, championNameById });
        }
        console.log("accountIdEncrypted: ", accountId);
        const totalGames = await getNumOfTotalGames(accountId);
        let forRange = Math.ceil(totalGames/100);
        let matchlist = []; // (array of objects with matchId and championId)
        let beginIndex=0;
        let endIndex=100;
        let lastMatchId = '';
        // fetch all ranked matches played by the user, process those data to save(gameId(matchId), champion(id), and timestamp)
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
                soloRankTier: summonerRankInfo.soloTier, 
                soloRankRank: summonerRankInfo.soloRank, 
                soloRankLeaguePoints: summonerRankInfo.soloLeaguePoints, 
                soloRankWins: summonerRankInfo.soloWins, 
                soloRankLose: summonerRankInfo.soloLosses,
                lastMatchId,
                matchList: matchlist,
                championRecords: {}
            })
            await user.save();
            await processData(user);
            await user.populate("championRecords");
            let champion_records = user.championRecords;
            return res.render("summoner", { summoner, summonerRankInfo, champion_records });
        } catch(error) {
            console.log(error);
            return res.send(`error: ${error}`);
        }
    
    }else{
        res.redirect("/");
    }
}