import qs from "querystring";
import fetch from "node-fetch";
import ChampionRecord from "../models/ChampionRecord";
import { championId_by_championName } from "./champion_processed";

const API_KEY = "RGAPI-7fe9bb37-ccce-430d-81dc-6ee532bcb2f3";
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
export const getMatchList2 = async (numOfMatches, puuid, startTime) => {
    const matchlist = [];
    let counter = 0; // 임시 제한
    let startIndex = 0;
    console.log("startTime: ", startTime);
    while(true){
        // await sleep(2000);
        const matches = await( await fetch(`${API_ROOT_ASIA+MATCHES_BY_PUUID+puuid}/ids?startTime=${startTime}&start=${startIndex}&count=100&api_key=${API_KEY}`)).json();
        console.log("matches", matches);
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
export const getMatchList = async (numOfMatches, puuid, startTime) => {
    console.log("startTime: ", startTime);
    const matchlist = [];
    let startIndices = [];
    // const matchlistRequestMax = Math.floor(numOfMatches/100)+1;
    const matchlistRequestMax = 1;
    for(let i = 0; i < matchlistRequestMax; i++){
        startIndices.push(i*100);
    }
    try {
        const matchlistObjectsFetched = await Promise.all(startIndices.map((startIndex) => {
            // 이 안에 try catch또 해야하나?
            console.log("startIndex inside Promise.all: ", startIndex);
            return fetch(`${API_ROOT_ASIA+MATCHES_BY_PUUID+puuid}/ids?startTime=${startTime}&start=${startIndex}&count=100&api_key=${API_KEY}`);
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
        const matchObject = await (await fetch(`${API_ROOT_ASIA+MATCH_BY_MATCHID+matchId}?api_key=${API_KEY}`)).json();
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
        await a_championRecord.save(); // match마다 다른 object로 바뀌는 녀석이므로 각 match loop끝날때마다 save해주는 것이 맞을듯. 근데 findOneAndUpdate로 map set을 할수도 있나? 그러면 save도 안해도 될텐데. 
        // await user_db.save();
        // await user_db.save();에 대해 생각을 좀 해봐야 할듯. 퍼포먼스/안정성 차이가 있는지 궁금하고. 어디에 위치시킬건지 얼마나 중복을 제거해야 할지 생각해봐야할듯. match마다 save할 것인지 모든 match끝나고 save할 것인지. 이 함수 밖에서 선언된 녀석이므로 모든 match하고 나서 함수 끝날때 save해도 될듯함? 
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
    const max = 5;
    // matchlist에 있는 match들을 모두 한번에 fetch하면 rate limit초과하기 때문에 일단 임시로 앞에 다섯개만 가져와서 처리해보려고 함.
    const temporary_matchlist = []
    for(let i = 0; i < max; i++){
        temporary_matchlist.push(matchlist[i]);
    }

    // promise.all방식으로 한번에 모든 matchlists fetch 한다음
    // 그렇게 fetch된 matchlist들을 또 한번에 json화 해줌. 
    const matchObjectsFetched = await Promise.all(temporary_matchlist.map( matchId => {
        console.log("fetching ", matchId);
        return fetch(`${API_ROOT_ASIA+MATCH_BY_MATCHID+matchId}?api_key=${API_KEY}`);
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
            return ChampionRecord.findById(strs[0]);
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
    console.log("championRecords_db[0]: ", championRecords_db[0]);
    console.log("championRecords_db.length: ", championRecords_db.length);
    // register championRecords objectIds to the User
    championRecords_db.forEach(championRecord_db => {
        if(!user_db[championRecord_db.season].has(championRecord_db.championId.toString())){
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