import qs from "querystring";
import fetch from "node-fetch";
import ChampionRecord from "../models/ChampionRecord";
import { championId_by_championName } from "./champion_processed";

var ObjectId = require('mongoose').Types.ObjectId; 

const API_KEY = "RGAPI-a730ef94-1660-43fc-b9bd-96dda3386c9e";
const API_ROOT = "https://kr.api.riotgames.com/lol/";
const API_ROOT_ASIA = "https://asia.api.riotgames.com/lol/";
const MATCH_BY_MATCHID = "match/v5/matches/";
const MATCHES_BY_PUUID = "match/v5/matches/by-puuid/";
const SUMMONERS_BY_NAME = "summoner/v4/summoners/by-name/";
const RANK_INFO_BY_SUMMONERID = "league/v4/entries/by-summoner/";

export const getSummonerProfile = async (summonerName) => {
    const encodedSummonerName = qs.escape(summonerName)
    const summonerProfile = await (await fetch(`${API_ROOT+SUMMONERS_BY_NAME+encodedSummonerName}?api_key=${process.env.PR_API_KEY}`)).json();
    return summonerProfile;
};
export const getSummonerRankInfo = async (summonerId) => {
    const summonerRankDataList = await (await fetch(`${API_ROOT+RANK_INFO_BY_SUMMONERID+summonerId}?api_key=${process.env.PR_API_KEY}`)).json();
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
export const getMatchList2 = async (numOfMatches, puuid, startTime) => {
    const matchlist = [];
    let counter = 0; // ?????? ??????
    let startIndex = 0;
    console.log("startTime: ", startTime);
    while(true){
        // await sleep(2000);
        const matches = await( await fetch(`${API_ROOT_ASIA+MATCHES_BY_PUUID+puuid}/ids?startTime=${startTime}&start=${startIndex}&count=100&api_key=${process.env.PR_API_KEY}`)).json();
        console.log("matches", matches);
        // [KR_5478478, ... ] ????????? matchlist array???. 
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
export const getMatchList = async (numOfMatches, puuid, startTime) => {
    console.log("startTime: ", startTime);
    const matchlist = [];
    let startIndices = [];
    // const matchlistRequestMax = Math.floor(numOfMatches/100)+1;
    const matchlistRequestMax = 5;
    for(let i = 0; i < matchlistRequestMax; i++){
        startIndices.push(i*100);
    }

    // startIndices = [ 100 ];

    try {
        const matchlistObjectsFetched = await Promise.all(startIndices.map((startIndex) => {
            // ??? ?????? try catch??? ?????????????
            console.log("startIndex inside Promise.all: ", startIndex);
            return fetch(`${API_ROOT_ASIA+MATCHES_BY_PUUID+puuid}/ids?startTime=${startTime}&start=${startIndex}&count=100&api_key=${process.env.PR_API_KEY}`);
        }));
        const matchlistObjectsJSONed = await Promise.all(matchlistObjectsFetched.map(matchesNotJson => {
            console.log("doing jsonify");
            return matchesNotJson.json();
        }));
        // matchlistObjectsJSONed.forEach( matches => console.log("matches: ", matches));
        matchlistObjectsJSONed.forEach( matches => matches.forEach(matchId => matchlist.push(matchId)));
        console.log("matchlist length: ", matchlist.length);
    }catch(e){
        console.log(e.message);
    }
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
        console.log("processwinrates: ", champRecordId);
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

export const updateChampionRecords2 = async (user_db, matchlist) => {
    let counter = 0;
    const max = 4;
    for(const matchId of matchlist){
        // await sleep(1500);
        console.log("processing match #", counter);
        const matchObject = await (await fetch(`${API_ROOT_ASIA+MATCH_BY_MATCHID+matchId}?api_key=${process.env.PR_API_KEY}`)).json();
        console.log("api match called, matchId: ", matchId);
        // if there is an error with the api call, print status and continue to the next match
        const { status } = matchObject;
        if(status){
            console.log("api call error, status: ", status);
            counter++;
            if(counter>max)
                break;
            continue;
        }
        // check if this match is a ranked solo queue. if not, continue.
        if(![4, 420].includes(matchObject.info.queueId)){
            counter++;
            if(counter>max)
                break;
            continue;
        }
        // ????????? ????????? counter??? ??????????????? ?????? ????????? max?????? ?????? api????????? ????????? ??? ??????. ?????? ??????????????????. 

        // check match start time so that we can determine which championrecords season this match should be classified into.
        // 1610046000 = ???????????? 2021??? 1??? 8??? ?????? 4???
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
        const userChampionId = championId_by_championName[userChampionName]; // ????????? api???????????? match v5??? info.participant.championId ??? ???????????? ????????? ?????? ????????? ???????????? ???????????? ????????? championName??? ????????? ???????????? ??????. ????????? ???????????? ????????? ?????? ????????????. ???????????? KR_4960757039?????? ??????. ????????? participant??? championId??? championId: 37225015?????? ?????? ??????. ????????? ??? ???????????? id??? ???????????? ????????? championName??? ???????????? ????????? id??? convert?????? ????????? ????????? ???.  

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
                });
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
        await a_championRecord.save(); // match?????? ?????? object??? ????????? ??????????????? ??? match loop??????????????? save????????? ?????? ?????????. ?????? findOneAndUpdate??? map set??? ????????? ??????? ????????? save??? ????????? ?????????. 
        // await user_db.save();
        // await user_db.save();??? ?????? ????????? ??? ????????? ??????. ????????????/????????? ????????? ????????? ????????????. ????????? ?????????????????? ????????? ????????? ???????????? ?????? ?????????????????????. match?????? save??? ????????? ?????? match????????? save??? ?????????. ??? ?????? ????????? ????????? ??????????????? ?????? match?????? ?????? ?????? ????????? save?????? ?????????? 
        counter++;
        if(counter>max)
            break;
    }
    await processWinratesAllSeasons(user_db);
    await updateMostEncountered(user_db);
    // await user_db.save();
};

export const updateChampionRecords = async (user_db, matchlist) => {
    let counter = 0;
    const max = 450;
    // matchlist??? ?????? match?????? ?????? ????????? fetch?????? rate limit???????????? ????????? ?????? ????????? ?????? ???????????? ???????????? ?????????????????? ???.
    const temporary_matchlist = [];
    for(let i = 0; i < matchlist.length; i++){
        temporary_matchlist.push(matchlist[i]);

        counter++
        if(counter == max){
            break;
        }
    }

    // promise.all???????????? ????????? ?????? matchlists fetch ?????????
    // ????????? fetch??? matchlist?????? ??? ????????? json??? ??????. 
    const matchObjectsFetched = await Promise.all(temporary_matchlist.map( matchId => {
        console.log("fetching ", matchId);
        return fetch(`${API_ROOT_ASIA+MATCH_BY_MATCHID+matchId}?api_key=${process.env.PR_API_KEY}`);
    }))
    const matchObjectsJSONed = await Promise.all(matchObjectsFetched.map( matchFetched => {
        return matchFetched.json();
    }));

    // make a mock championRecords Map object at server side.
    let championRecords_server = new Map();
    for(const matchObject of matchObjectsJSONed){
        const { status } = matchObject;
        // if there is an error with the api call, print status and continue to the next match
        if(status){
            console.log("api call error, status: ", status);
            continue;
        }
        // check if this match is a ranked solo queue. if not, continue.
        if(![4, 420].includes(matchObject.info.queueId)){
            continue;
        }
        // check match start time so that we can determine which championrecords season this match should be classified into.
        // 1610046000 = ???????????? 2021??? 1??? 8??? ?????? 4???
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
        console.log(`userTeamId: ${userTeamId}, userWin: ${userWin}`);
        const userChampionId = championId_by_championName[userChampionName];

        // if dne, create server championRecords
        const championRecord_server_Id = userChampionId.toString()+'_'+championRecords_key;
            // should be split later when updating db
        if(!championRecords_server.has(championRecord_server_Id)){
            championRecords_server.set(championRecord_server_Id, {
                championId: userChampionId,
                numOfGamesPlayed: 0,
                wins: 0,
                winRate: 0,
                encounteredChampionsList: new Map(),
                mostPlayedWith: '',
                mostPlayedAgainst: '',
                mostEncountered: ''
            });
        }

        const a_championRecords_server = championRecords_server.get(championRecord_server_Id);
        a_championRecords_server.numOfGamesPlayed+=1;
        a_championRecords_server.wins+=(userWin ? 1 : 0);
        for(const player of playersAtThisMatch){
            // if the player is the user, skip it
            if(player.puuid == user_db.puuid)
                continue;
            // if encountered record DNE, create one
            const champId_playedByPlayer = championId_by_championName[player.championName];
            if(!a_championRecords_server.encounteredChampionsList.has(champId_playedByPlayer.toString())){
                a_championRecords_server.encounteredChampionsList.set(champId_playedByPlayer.toString(), {
                    id: champId_playedByPlayer,
                    playedAgainst: 0,
                    playedWith: 0,
                    winAgainst: 0,
                    winWith: 0,
                    winRateAgainst: 0,
                    winRateWith: 0
                });
            }

            if(player.teamId == userTeamId){
                a_championRecords_server.encounteredChampionsList.get(champId_playedByPlayer.toString()).playedWith += 1;
                if(userWin){
                    a_championRecords_server.encounteredChampionsList.get(champId_playedByPlayer.toString()).winWith += 1;
                }
            }else{
                a_championRecords_server.encounteredChampionsList.get(champId_playedByPlayer.toString()).playedAgainst += 1;
                if(userWin){
                    a_championRecords_server.encounteredChampionsList.get(champId_playedByPlayer.toString()).winAgainst += 1;
                }
            }
        }
    }
    // console.log("championRecords_server: ", championRecords_server);
    console.log("mock championrecords(server) done");
    console.log("championRecords_server.length: ", Array.from(championRecords_server).length);
    // get and create championRecords
    const championRecords_db = await Promise.all(Array.from(championRecords_server.keys()).map( key => {
        const strs = key.split('_');
        if(user_db[strs[1]].has(strs[0])){
            console.log("just returning existing champRecord");
            return ChampionRecord.findById(user_db[strs[1]].get(strs[0]));
        }else{
            console.log("creating new champRecord");
            return ChampionRecord.create({
                championId: Number(strs[0]),
                season: strs[1],
                numOfGamesPlayed: 0,
                wins: 0,
                winRate: 0,
                encounteredChampionsList: {},
                mostPlayedWith: '',
                mostPlayedAgainst: '',
                mostEncountered: ''
            });
        }
    }));
    console.log("championRecords_db.length: ", championRecords_db.length);
    // register championRecords objectIds to the User
    championRecords_db.forEach(championRecord_db => {
        if(!user_db[championRecord_db.season].has(championRecord_db.championId.toString())){
            // console.log("championRecord_db._id: ", championRecord_db._id);
            console.log("championRecord_db.championId: ", championRecord_db.championId);
            console.log("user_db[championRecord_db.season].size: ", user_db[championRecord_db.season].size);
            user_db[championRecord_db.season].set(championRecord_db.championId.toString(), championRecord_db._id)
        }
    });
    await user_db.save();
    console.log("new championRecords are registered to User and saved.");
    // update championRecords, including encounteredChampionsList
    championRecords_db.forEach(championRecord_db => {
        const according_champRecord_server = championRecords_server.get(championRecord_db.championId.toString()+'_'+championRecord_db.season);
        championRecord_db.numOfGamesPlayed += according_champRecord_server.numOfGamesPlayed;
        championRecord_db.wins += according_champRecord_server.wins;
        championRecord_db.winRate = championRecord_db.wins/championRecord_db.numOfGamesPlayed;
        let maxPlayedWith = 0;
        let maxPlayedAgainst = 0;
        let maxEncountered = 0;
        let mostWith_id = '';
        let mostAgainst_id = '';
        let mostEncountered_id = '';
        for(const [encChampid, encChampObj] of according_champRecord_server.encounteredChampionsList){
            const plyd_wth = encChampObj.playedWith;
            const plyd_agnst = encChampObj.playedAgainst;
            const total_encntrd = plyd_wth + plyd_agnst;
            if(plyd_wth > maxPlayedWith){
                maxPlayedWith = plyd_wth;
                mostWith_id = encChampid;
            }
            if(plyd_agnst > maxPlayedAgainst){
                maxPlayedAgainst = plyd_agnst;
                mostAgainst_id = encChampid
            }
            if(total_encntrd > maxEncountered){
                maxEncountered = total_encntrd;
                mostEncountered_id = encChampid;
            }

            if(!championRecord_db.encounteredChampionsList.has(encChampid)){
                championRecord_db.encounteredChampionsList.set(encChampid, {
                    id: encChampObj.id,
                    playedAgainst: 0,
                    playedWith: 0,
                    winAgainst: 0,
                    winWith:0,
                    winRateAgainst:0,
                    winRateWith:0
                })
            }
            const encChampObj_db = championRecord_db.encounteredChampionsList.get(encChampid);
            encChampObj_db.playedAgainst += encChampObj.playedAgainst;
            encChampObj_db.playedWith += encChampObj.playedWith;
            encChampObj_db.winAgainst += encChampObj.winAgainst;
            encChampObj_db.winWith += encChampObj.winWith;
            encChampObj_db.winRateAgainst = encChampObj_db.playedAgainst>0 ? encChampObj_db.winAgainst/encChampObj_db.playedAgainst : 0;
            encChampObj_db.winRateWith = encChampObj_db.playedWith>0 ? encChampObj_db.winWith/encChampObj_db.playedWith : 0;
        }
        championRecord_db.mostPlayedWith = mostWith_id;
        championRecord_db.mostPlayedAgainst = mostAgainst_id;
        championRecord_db.mostEncountered = mostEncountered_id;
    });
    // console.log("championRecords_db[0] numofGamePlayed and etc. ", championRecords_db[0]);
    // console.log("championRecords_db[0].encounteredChampionsList", championRecords_db[0].encounteredChampionsList);
    // save all championRecords updated
    await Promise.all(championRecords_db.map(championRecord_db => {
        console.log("saving after encounteredList update:", championRecord_db.season, championRecord_db.championId);
        championRecord_db.save();
    }));
    console.log("saved.");
};