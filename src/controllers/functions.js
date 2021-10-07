import qs from "querystring";
import fetch from "node-fetch";
import ChampionRecord from "../models/ChampionRecord";
import { championId_by_championName } from "../../champion_processed";

const API_KEY = "RGAPI-fd48ef31-7e26-4879-a0a6-7fb352971454";
const API_ROOT = "https://kr.api.riotgames.com/lol/";
const API_ROOT_ASIA = "https://asia.api.riotgames.com/lol/";
const MATCH_BY_MATCHID = "match/v5/matches/";
const MATCHES_BY_PUUID = "match/v5/matches/by-puuid/";
const SUMMONERS_BY_NAME = "summoner/v4/summoners/by-name/";
const RANK_INFO_BY_SUMMONERID = "league/v4/entries/by-summoner/";

export const getSummonerProfile = async (summonerName) => {
    const encodedSummonerName = qs.escape(summonerName)
    const summonerProfile = await (await fetch(`${API_ROOT+SUMMONERS_BY_NAME+encodedSummonerName}?api_key=${API_KEY}`)).json();
    return summonerProfile;
};

export const getSummonerRankInfo = async (summonerId) => {
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

export const getMatchList = async (puuid, startTime) => {
    const matchlist = [];
    let counter = 0; // 임시 제한
    let startIndex = 0;
    while(true){
        const matches = await( await fetch(`${API_ROOT_ASIA+MATCHES_BY_PUUID+puuid}/ids?startTime=${startTime}&start=${startIndex}&count=100&api_key=${API_KEY}`)).json();
        // [KR_5478478, ... ] 형식의 matchlist array임. 
        if(matches.length == 0)
            break;
        
        for(let i=0; i<matches.length; i++)
            matchlist.push(matches[i])
    
        startIndex+=100;


        counter++;
        if(counter > 0)
            break;
    }
    console.log("matchlist length: ", matchlist.length);
    return matchlist; 
};

const getUserStuffs = (participants, userPuuid) => {
    for(const participant of participants){
        if(participant.puuid == userPuuid){
            console.log("player: ", participant.summonerName);
            const userChampionName = participant.championName, userTeamId = participant.teamId, userWin = participant.win;
            return { userChampionName, userTeamId, userWin };
        }
    }
};

export const updateChampionRecords = async (user_db, matchlist) => {
    let counter = 0;
    const max = 0;
    for(const matchId of matchlist){
        const matchObject = await (await fetch(`${API_ROOT_ASIA+MATCH_BY_MATCHID+matchId}?api_key=${API_KEY}`)).json();
        const players = matchObject.info.participants;
        const { userChampionName, userTeamId, userWin }= getUserStuffs(players, user_db.puuid);
        console.log(`userTeamId: ${userTeamId}, userWin: ${userWin}`);
        const userChampionId = championId_by_championName[userChampionName];

        if(!user_db.championRecords11.has(userChampionId.toString())){
            const a_championRecord = new ChampionRecord({
                championId: userChampionId,
                numOfGamesPlayed: 0,
                wins: 0,
                winRate: 0,
                encounteredChampionsList: {},
                mostPlayedWith: '',
                mostPlayedAgainst: '',
                mostEncountered: ''
            });
            await a_championRecord.save();
            user_db.championRecords11.set(userChampionId.toString(), a_championRecord._id);
            await user_db.save();
        }

        // const a_championRecord = await ChampionRecord

        counter++;
        if(counter>max)
            break;
    }
};