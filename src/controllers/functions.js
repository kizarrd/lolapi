import qs from "querystring";
import fetch from "node-fetch";
import ChampionRecord from "../models/ChampionRecord";
import { championId_by_championName } from "./champion_processed";

const API_KEY = "RGAPI-c4f50a4c-681d-45cd-be8e-8aa069587d5c";
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
    console.log("startTime: ", startTime);
    while(true){
        await sleep(2000);
        const matches = await( await fetch(`${API_ROOT_ASIA+MATCHES_BY_PUUID+puuid}/ids?startTime=${startTime}&start=${startIndex}&count=100&api_key=${API_KEY}`)).json();
        console.log("matches", matches);
        // [KR_5478478, ... ] 형식의 matchlist array임. 
        if(matches.length == 0)
            break;
        
        for(let i=0; i<matches.length; i++)
            matchlist.push(matches[i])
    
        startIndex+=100;

        counter++;
        // if(counter > 0)
        //     break;
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
const processWinratesAllSeasons = async (user_db) => {
    for(const champRecordId of user_db.championRecords11.values()){
        const champRecord = await ChampionRecord.findById(champRecordId);
        champRecord.winRate = champRecord.wins / champRecord.numOfGamesPlayed;
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
    for(const champRecordId of user_db.championRecords12.values()){
        const champRecord = await ChampionRecord.findById(champRecordId);
        champRecord.winRate = champRecord.wins / champRecord.numOfGamesPlayed;
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
    for(const champRecordId of user_db.championRecordsBefore.values()){
        const champRecord = await ChampionRecord.findById(champRecordId);
        champRecord.winRate = champRecord.wins / champRecord.numOfGamesPlayed;
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

const updateMostEncountered = async (user_db) => {
    for(const champRecordId of user_db.championRecords11.values()){
        const champRecord = await ChampionRecord.findById(champRecordId);
        let maxPlayedWith = 0;
        let maxPlayedAgainst = 0;
        let maxEncountered = 0;
        let mostWith_id = 0;
        let mostAgainst_id = 0;
        let mostEncountered_id = 0;
        for(const encounteredChamp of champRecord.encounteredChampionsList.values()){
            const plyd_wth = encounteredChamp.playedWith;
            const plyd_agnst = encounteredChamp.playedAgainst;
            const total_encntrd = plyd_wth + plyd_agnst;
            if(plyd_wth > maxPlayedWith){
                maxPlayedWith = plyd_wth;
                mostWith_id = encounteredChamp.id;
            }
            if(plyd_agnst > maxPlayedAgainst){
                maxPlayedAgainst = plyd_agnst;
                mostAgainst_id = encounteredChamp.id
            }
            if(total_encntrd > maxEncountered){
                maxEncountered = total_encntrd;
                mostEncountered_id = encounteredChamp.id;
            }
        }
        champRecord.mostPlayedWith = mostWith_id.toString();
        champRecord.mostPlayedAgainst = mostAgainst_id.toString();
        champRecord.mostEncountered = mostEncountered_id.toString();
        await champRecord.save();
    }
};

const sleep = async (millis) => {
    return new Promise(resolve => setTimeout(resolve, millis));
};

export const updateChampionRecords = async (user_db, matchlist) => {
    let counter = 0;
    const max = 19;
    for(const matchId of matchlist){
        await sleep(1500);
        console.log("processing match #", counter);
        const matchObject = await (await fetch(`${API_ROOT_ASIA+MATCH_BY_MATCHID+matchId}?api_key=${API_KEY}`)).json();
        console.log("api match called, matchId: ", matchId);
        // if there is an error with the api call, print status and continue to the next match
        const { status } = matchObject;
        if(status){
            console.log("api call error, status: ", status);
            counter++;
            continue;
        }
        // check if this match is a ranked solo queue. if not, continue.
        if(![4, 420].includes(matchObject.info.queueId)){
            counter++;
            continue;
        }
        // 자랭의 경우에 counter가 올라가도록 하지 않으면 max보다 많이 api요청이 발생할 수 있음. 미처 생각못했었네. 

        // check match start time so that we can determine which championrecords season this match should be classified into.
        // 1610046000 = 한국시간 2021년 1월 8일 오전 4시
        let championRecords_key;
        const baseStr = 'championRecords';
        const season11StartTime = 1610046000;
        if(matchObject.info.gameStartTimestamp >= season11StartTime){
            championRecords_key = baseStr+'11';
        }else{
            championRecords_key = baseStr+'Before';
        }

        const playersAtThisMatch = matchObject.info.participants;
        const { userChampionName, userTeamId, userWin }= getUserStuffs(playersAtThisMatch, user_db.puuid);
        console.log("matchId: ", matchId);
        console.log(`userTeamId: ${userTeamId}, userWin: ${userWin}`);
        const userChampionId = championId_by_championName[userChampionName]; // 라이엇 api안내에서 match v5의 info.participant.championId 가 부정확한 경우가 있기 때문에 챔피언을 구분하기 위해서 championName을 쓰라고 권고하고 있음. 실제로 부정확한 경우를 내가 확인했음. 예를들어 KR_4960757039같은 경우. 첫번째 participant의 championId가 championId: 37225015라고 되어 있음. 하지만 내 앱에서는 id가 필요하기 때문에 championName을 가져와서 정확한 id로 convert하는 방법을 쓰기로 함.  

        // if the championrecord of the champion played by the user in this match does not exist in the user db instance, make one
        if(!user_db[championRecords_key].has(userChampionId.toString())){
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
            user_db[championRecords_key].set(userChampionId.toString(), a_championRecord._id);
            await user_db.save();
        }

        // update wins and numOfGamesPlayed of the champion played by the user at this match
        const championRecord_objectId = user_db[championRecords_key].get(userChampionId.toString());
        await ChampionRecord.findByIdAndUpdate(championRecord_objectId, {
            $inc: { numOfGamesPlayed: 1, wins: (userWin ? 1 : 0) }
        });
        // by going through the champions played by other playersAtThisMatch at this match, update the encounteredChampionsList of the championRecord of the champion played by the user at this match.
        const a_championRecord = await ChampionRecord.findById(championRecord_objectId);
        for(const player of playersAtThisMatch){
            // if the player is the user, skip it
            if(player.puuid == user_db.puuid)
                continue;
            // if the there is no encountered record for this champion in the encounteredChampionsList, create a new encounteredChampion object and add it to the list
            const champId_playedByPlayer = championId_by_championName[player.championName];
            if(!a_championRecord.encounteredChampionsList.has(champId_playedByPlayer.toString())){
                // console.log(`champion ${userChampionName} has encountered champion ${player.championName} for the first time!`);
                a_championRecord.encounteredChampionsList.set(champId_playedByPlayer.toString(), {
                    id: champId_playedByPlayer,
                    playedAgainst: 0,
                    playedWith: 0,
                    winAgainst: 0,
                    winWith: 0,
                    winRateAgainst: 0,
                    winRateWith: 0
                })
                // console.log("championRecord after the first encounter: ", a_championRecord);
            }

            // await ChampionRecord.findByIdAndUpdate(championRecord_objectId, {
            //     $inc: { encounteredChampionsList: }
            // });

            if(player.teamId == userTeamId){
                a_championRecord.encounteredChampionsList.get(champId_playedByPlayer.toString()).playedWith += 1;
                if(userWin){
                    a_championRecord.encounteredChampionsList.get(champId_playedByPlayer.toString()).winWith += 1;
                }
            }else{
                a_championRecord.encounteredChampionsList.get(champId_playedByPlayer.toString()).playedAgainst += 1;
                if(userWin){
                    a_championRecord.encounteredChampionsList.get(champId_playedByPlayer.toString()).winAgainst += 1;
                }
            }
        }
        await a_championRecord.save(); // match마다 다른 object로 바뀌는 녀석이므로 각 match loop끝날때마다 save해주는 것이 맞을듯. 근데 findOneAndUpdate로 map set을 할수도 있나? 그러면 save도 안해도 될텐데. 
        // await user_db.save();
        // await user_db.save();에 대해 생각을 좀 해봐야 할듯. 퍼포먼스/안정성 차이가 있는지 궁금하고. 어디에 위치시킬건지 얼마나 중복을 제거해야 할지 생각해봐야할듯. match마다 save할 것인지 모든 match끝나고 save할 것인지. 이 함수 밖에서 선언된 녀석이므로 모든 match하고 나서 함수 끝날때 save해도 될듯함? 
        counter++;
        // if(counter>max)
        //     break;
    }
    await processWinratesAllSeasons(user_db);
    await updateMostEncountered(user_db);
    // await user_db.save();
};