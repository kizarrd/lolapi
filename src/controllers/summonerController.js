import fetch from "node-fetch";
import User from "../models/User";
import ChampionRecord from "../models/ChampionRecord";
import mongoose from "mongoose";
import qs from "querystring";
import championAssets_kr from "../../champion_kr.json";
import championAssets_us from "../../champion_us.json";
import { championAssets_pr } from "../../champion_processed";

class matchInfo {
    constructor(matchId, championId, timestamp){
        this.matchId = matchId;
        this.championId = championId;
        this.timestamp = timestamp;
    }
}

const API_KEY = "RGAPI-fa376e46-7014-4141-a711-eceb956a7548";
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
const getNumOfTotalGames = async ( encryptedId, beginTime ) => {
    let total_games = 0;
    if(beginTime){
        const { totalGames } = await (await fetch(`${API_ROOT+MATCHLISTS_BY_ACCOUNT+encryptedId}?beginTime=${beginTime}?endIndex=200&beginIndex=100&api_key=${API_KEY}`)).json();
        total_games = totalGames;
    }else{
        const { totalGames } = await (await fetch(`${API_ROOT+MATCHLISTS_BY_ACCOUNT+encryptedId}?endIndex=200&beginIndex=100&api_key=${API_KEY}`)).json();
        total_games = totalGames;
    }
    // 정확한 이유는 알 수 없으나 beginIndex를 이런식으로 설정하지 않고 그냥 matchlist요청을 하면 totalGames값이 훨씬 적은 값이 나온다. 예를들어서 실제 totalGames는 1700경기 이상이 기록되어 있는데 beginIndex를 default값인 0으로 두고 api요청을 하면 totalGames가 비정상적인 값인 135로 나오는 것. 하지만 위 코드에서 한것처럼 beginIndex를 100이상으로 설정하면 제대로 1700경기가 나옴. 
    // 검색해본 결과 riot api는 현재 시간으로부터 2년전까지의 데이터만 제공하는것으로 알고 있음. 
    // op.gg는 2년 넘은 데이터도 자체적으로 다 저장하고 있는 것일까?
    console.log("total games: ", total_games);
    return total_games;
};
const processWinrate = async (existingUser) => {
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
const updateMostEncountered = async (existingUser) => {
    for(const champRecordId of existingUser.championRecords.values()){
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
const processData = async (user_db) => {
    let counter = 0;
    for(const match of user_db.matchList){
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
        // 함수화 할 수 있을듯 getUserTeamIdAndResult(matchData_api);


        console.log(`userTeamId: ${userTeamId}, userWin: ${userWin}`);

        // if there's no championRecords for the champion played by the user in this match yet, then create one. else, increase the numOfGamesPlayed of the corresponding champion played by the user. 
        if(!user_db.championRecords.has(match.championId.toString())){
            var stringId = match.championId.toString()
            const a_championRecord = new ChampionRecord({
                championId: match.championId,
                numOfGamesPlayed: 0,
                encounteredChampionsList: {}
            })
            await a_championRecord.save();
            user_db.championRecords.set(stringId, a_championRecord._id);
        }

        const championRecord_objectId = user_db.championRecords.get(match.championId.toString());
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
    await processWinrate(user_db);
    await updateMostEncountered(user_db);
    await user_db.save(); // 얘를 각 함수 안에 넣는게 낫나??
};

const getChampionNameById = () => {
    // const championNameById = {};
    // for(const value of Object.values(championAssets_kr.data)){
    //     championNameById[value.key] = [value.id, championAssets_us.data[value.id].name, value.name];
    // }
    // console.log(championNameById);

    const championNameById = championAssets_pr;
    return championNameById;
};

export const summoner = async (req, res) => {

    // detect search action
    const { username2 } = req.query;
    if(username2){
        return res.redirect(`/summoners/${username2}`);
    }

    // get summoner name from the url params
    const { username } = req.params;
    const currentDate = new Date();
    const searchedTime = currentDate.getTime();
    console.log('epoch searched time: ', searchedTime);
    if(username){
        console.log('username from req.params (url): ', username);
        // check if this is a valid summoner name
        const summoner = await getSummonerData(username);// getSummonerInfo로 바꿀까
        const { status } = summoner;
        // if a summoner with the searched name does not exist:
        if(status){
            console.log("summoner not found, not a valid name");
            console.log(status);
            return res.redirect("/"); // 이거 재처리 해야 하나? 어떤 페이지로 보낼지.. 아니면 undefined되었다는 summoner object를 summoner와 함께 보낼지.
        }
        // else if the summoner exists:
        const { id: summonerId , accountId, puuid, name, summonerLevel, profileIconId } = summoner;

        // check if user exists in db. 
        // if already exists, get data from db and render it.
        const userAlreadyExists = await User.exists({userName: name});
        if(userAlreadyExists){
            const user_db = await User.findOne({ userName: name }).populate("championRecords");
            console.log("this user had been already searched before.");
            console.log(`name of the user: ${user_db.userName}`);
            console.log(`encryptedAccountId: ${accountId}`); // useful when looking at matchlist json format from api
            console.log(`# of matches recorded in db: ${user_db.matchList.length}`);
            console.log("soloRankTier: ", user_db.soloRankTier);

            const champion_records = user_db.championRecords;
            const championNameById = getChampionNameById();
            return res.render("summoner", { summoner, user_db, champion_records, championNameById }); 
            // 이름들이 좀 헷갈리네. 개선할 수 없을까.
            // summoner와 summonerRankInfo는 api에서 즉석으로 요청하여 얻은 object들이고
            // existingUser와 champion_records는 db에서 나온 녀석들이고(심지어 champion_records는 existingUser.championRecords일 뿐임. 그냥 existingUser만 넘겨서 template에서 existingUser.championRecords이런 식으로 활용해야 하나?)
            // 그리고 user가 db에 exist안할때도 template은 똑같기 때문에 같은 variable은 같은 이름으로 넘겨줘야됨.
            // championNameById는 로컬 파일에서 가져온 object임. 

            // 일단 existingUser대신 user_db로 넘겨보겠음.. 아래에서도 마찬가지.
            // summoner도 summoner_api이렇게 어디에서 온 녀석인지를 표시하는 이름을 사용하면 좀 코드 이해/유지/관리 가 쉬우려나?
        }
        // if this valid summoner does not exist in our db(=if user is searched for the first time), 
            // get match data of this user, 
            // process those data, create new db instances(records) with lastUpdateTime, and save it on db, 
            // and then get the data from the db and render it.  
        console.log("accountIdEncrypted: ", accountId);
        const totalGames = await getNumOfTotalGames(accountId);
        let forRange = Math.ceil(totalGames/100);
        let matchlist = []; // (array of objects with matchId and championId)
        let beginIndex=0;
        let endIndex=100;
        // fetch all ranked matches played by the user, process those data to save(gameId(matchId), champion(id), and timestamp)
        for(let i=0; i<forRange; i++) {
            let { matches: list } = await (await fetch(`${API_ROOT+MATCHLISTS_BY_ACCOUNT+accountId}?endIndex=${endIndex}&beginIndex=${beginIndex}&api_key=${API_KEY}`)).json();
            for(var j=0; j<list.length; j++) {
                if([4, 6, 42, 410, 420, 440].includes(list[j].queue)){
                    let instance = new matchInfo(list[j].gameId, list[j].champion, list[j].timestamp);
                    matchlist.push(instance);
                }
            }
            // console.log("speed check", i);
            console.log("matchlist length: ", matchlist.length);
            beginIndex+=100;
            endIndex+=100;
        }
        const summonerRankInfo = await getSummonerRankInfo(summonerId);
        console.log("soloRankTier: ", summonerRankInfo.soloTier);
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
                soloRankLoses: summonerRankInfo.soloLosses,
                lastUpdateTime: searchedTime,
                matchList: matchlist,
                championRecords: {}
            })
            await user.save();
            await processData(user);
            const userPopulated =  await User.findOne({ userName: name }).populate("championRecords");
            const user_db = userPopulated;
            const champion_records = userPopulated.championRecords;
            const championNameById = getChampionNameById();
            return res.render("summoner", { summoner, summonerRankInfo, user_db, champion_records, championNameById });
        } catch(error) {
            console.log(error);
            return res.send(`error: ${error}`);
        }
    }else{
        res.redirect("/");
    }
}

export const update = async (req, res) => {
    const { username } = req.params;
    console.log("update controller called, username from params: ", username);
    console.log("encodeURI: ", encodeURI(username));
    const currentDate = new Date();
    const searchedTime = currentDate.getTime();

    //if username can be found from url req.params
    if(username){
        const summoner = await getSummonerData(username);
        const { status } = summoner;
        // if invalid summoner name, send error response 404
        if(status){
                console.log("summoner not found, not a valid name");
                console.log("status obj, riot api: ", status);
                return res.sendStatus(404);
        }
        // else if the summoner exists, check if the user is already in our db.
        // if in db, update
        // if not in db, it cannot be updated, therefore send error response 404
        const { id: summonerId , accountId, puuid, name, summonerLevel, profileIconId } = summoner;
        const userAlreadyExists = await User.exists({userName: name});

        if(userAlreadyExists){
            const user_db = await User.findOne({ userName: name }).populate("championRecords");
            const totalGames = await getNumOfTotalGames(accountId, user_db.lastUpdateTime);
            let forRange = Math.ceil(totalGames/100);
            let matchlist = []; // (array of objects with matchId and championId)
            let beginIndex=0;
            let endIndex=100;

            for(let i=0; i<forRange; i++) {
                let { matches: list } = await (await fetch(`${API_ROOT+MATCHLISTS_BY_ACCOUNT+accountId}?beginTime=${user_db.lastUpdateTime}?endIndex=${endIndex}&beginIndex=${beginIndex}&api_key=${API_KEY}`)).json();
                for(var j=0; j<list.length; j++) {
                    if([4, 6, 42, 410, 420, 440].includes(list[j].queue)){
                        let instance = new matchInfo(list[j].gameId, list[j].champion, list[j].timestamp);
                        matchlist.push(instance);
                    }
                }
                
                // console.log("speed check", i);
                console.log("matchlist length: ", matchlist.length);
                beginIndex+=100;
                endIndex+=100;
            }

            // process data of matches

            let counter = 0;
            for(const match of matchlist){
                const matchData = await (await fetch(`${API_ROOT+MATCH_BY_MATCHID+match.matchId}?api_key=${API_KEY}`)).json();

                // 함수화 할 수 있을듯 getUserTeamIdAndResult(matchData_api);
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

                console.log(`userTeamId: ${userTeamId}, userWin: ${userWin}`);

                if(!user_db.championRecords.has(match.championId.toString())){
                    var stringId = match.championId.toString()
                    const a_championRecord = new ChampionRecord({
                        championId: match.championId,
                        numOfGamesPlayed: 0,
                        encounteredChampionsList: {}
                    })
                    await a_championRecord.save();
                    user_db.championRecords.set(stringId, a_championRecord._id);
                }

                const championRecord_objectId = user_db.championRecords.get(match.championId.toString());
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
            await processWinrate(user_db);
            await updateMostEncountered(user_db);
            await user_db.save(); // 얘를 각 함수 안에 넣는게 낫나??
        }else{
            // return res.sendStatus(404);
        }

        return res.sendStatus(200);
    }else{
        return res.sendStatus(400); 
    }
};