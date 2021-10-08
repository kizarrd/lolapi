import { getSummonerProfile, getSummonerRankInfo, getMatchList, updateChampionRecords } from "./functions";
import { championNameById } from "../../champion_processed";
import User from "../models/User";

export const summonerNoParam = (req, res) => {
    res.redirect("/");
};

export const summoner2 = async (req, res) => {
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
    
    const user_db = await User.findOne({ userName: name }).populate("championRecordsBefore").populate("championRecords11");
    // console.log("ohojokadj: ", user_db[`championRecords${11}`]);
    const champion_records = user_db.championRecords11;
    return res.render("summoner", { summoner, user_db, champion_records, championNameById });
};