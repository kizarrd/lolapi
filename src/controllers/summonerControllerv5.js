import { getSummonerProfile, getSummonerRankInfo, getMatchList, updateChampionRecords } from "./functions";
import { championNameById } from "./champion_processed";
import User from "../models/User";

const PATCH_VERSION = "11.20.1";
const DDRAGON = `http://ddragon.leagueoflegends.com/cdn/${PATCH_VERSION}/`;

export const summonerNoParam = (req, res) => {
    res.redirect("/");
};

export const summoner = async (req, res) => {
    // if another name searched, redirect with the name searched
    const { username_search } = req.query;
    if(username_search) 
        return res.redirect(`/summoners/${username_search}`);

    // get summoner name from the url params
    const { username } = req.params;
    const currentDate = new Date();
    const searchedTime = currentDate.getTime();
    console.log('epoch searched time: ', searchedTime);

    // check if username can be found from url req.params
    if(!username)
        return res.redirect("/");

    console.log('username from req.params (url): ', username);
    // check if this is a valid summoner name
    const summoner = await getSummonerProfile(username);// getSummonerInfo로 바꿀까
    const { status } = summoner;
    if(status){
        console.log("summoner not found, not a valid name");
        console.log(status);
        return res.redirect("/"); // 이거 재처리 해야 하나? 어떤 페이지로 보낼지.. 아니면 undefined되었다는 summoner object를 summoner와 함께 보낼지.
    }
    // else if the summoner exists:
    const { id: summonerId , accountId, puuid, name, summonerLevel, profileIconId } = summoner;

    // check if the user exists in our db. if it doesn't, create one
    // const userAlreadyExists = undefined;
    const userAlreadyExists = await User.exists({userName: name});
    if(!userAlreadyExists){
        // get rank info
        const summonerRankInfo = await getSummonerRankInfo(summonerId);
        console.log("soloRankTier: ", summonerRankInfo.soloTier);
        // get matchlist
        // console.log("puuid: ", puuid);
        const matchlist = await getMatchList(puuid, 0);
        // console.log("last match id: ", matchlist[0]);
        try{
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
                championRecordsBefore: {},
                championRecords11: {},
                championRecords12: {}
            })
            await user.save();
            await updateChampionRecords(user, matchlist);
        }catch(error){
            console.log(error);
            return res.send(`error: ${error}`);
        }
        
    }
    // find the user from our db and pass it over to render method.
    const user_db = await User.findOne({ userName: name }).populate("championRecordsBefore").populate("championRecords11").populate("championRecords12"); // 이것도 아마 production key받으면 puuid로 해야할듯? 
    // console.log("ohojokadj: ", user_db[`championRecords${11}`]);
    // const champion_records = user_db.championRecords11;
    const champion_records_sorted = [];
    for(var champion_record in Object.fromEntries(user_db.championRecords11)){
        champion_records_sorted.push([champion_record, user_db.championRecords11.get(champion_record).numOfGamesPlayed]);
    }
    champion_records_sorted.sort((a, b) =>{
        return b[1] - a[1];
    })
    return res.render("summoner", { summoner, user_db, champion_records_sorted, championNameById, DDRAGON });
};

export const update = async (req, res) => {
    const { username } = req.params;
    console.log("update controller called, username from params: ", username);
    // console.log("encodeURI: ", encodeURI(username));

    // if something's wrong with the username(maybe not found), then return error statuscode 400
    if(!username)
        return res.sendStatus(400);
    // if invalid summoner name, send error ststuscode 404
    const summoner = await getSummonerProfile(username);
    const { status } = summoner; // 이게 summoner object안에 status대신 다른 이름의 object가 있으면 그게 전달되는게 아닌가? 이름이 같아야 하는거겠지? 그런거같은데. 
    if(status){
        console.log("summoner not found, not a valid name");
        console.log("status obj, riot api: ", status);
        return res.sendStatus(404);
    }
    // if user not in our db, send error statuscode 404
    const { id: summonerId , accountId, puuid, name, summonerLevel, profileIconId } = summoner;
    const userAlreadyExists = await User.exists({userName: name});
    if(!userAlreadyExists)
        return res.sendStatus(404);

    // if summoner exists and user is in db, update the user.
    const summonerRankInfo = await getSummonerRankInfo(summonerId);
    console.log("soloRankTier: ", summonerRankInfo.soloTier);
    // get matchlist
    const user_db = await User.findOne({ userName: name }).populate("championRecords11").populate("championRecordsBefore").populate("championRecords12");
    // const user_db = await User.findOne({ puuid: puuid });
    // 이거 이렇게 puuid로 바꾸어야 할듯. 닉변한경우 검색하려면 puuid로 해야함 이게 summoner의 고유값이기 때문에 하지만 지금은 product key가없기 때문에 아마 api key를 새로 받을때마다 puuid가 달라질 것임. 그래서 일단 username으로 가자. 앱의 다른 부분에도 username을 쓴 부분이 있을텐데 한번 잘 살펴봐야겠다. 1633696584236
    const matchlist = await getMatchList(puuid, Math.ceil(user_db.lastUpdateTime/1000));
    console.log("matchlist length from update: ", matchlist.length);
    await updateChampionRecords(user_db, matchlist);

    console.log("user_db.lastUpdateTime before: ", user_db.lastUpdateTime);
    // update user's lastUpdateTime
    const currentDate = new Date();
    user_db.lastUpdateTime = currentDate.getTime();
    await user_db.save();
    console.log("user_db.lastUpdateTime after save: ", user_db.lastUpdateTime);
    return res.sendStatus(200);
};