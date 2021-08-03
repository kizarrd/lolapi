import fetch from "node-fetch";

const API_KEY = "RGAPI-1ee6e8f2-bbe6-4a33-ade9-0e992b4b2d20";
const API_ROOT = "https://kr.api.riotgames.com/";
const SUMMONERS_BY_NAME = "lol/summoner/v4/summoners/by-name/";
const MATCHLISTS_BY_ACCOUNT = "lol/match/v4/matchlists/by-account/";
const SUMMONER_NAME = "summit road";
let SUMMONER_ID_ENCRYPTED = ""; 
const championId = "4";

export const home = async (req, res) => {
    // const accountData = await fetch(`${API_ROOT+SUMMONERS_BY_NAME+SUMMONER_NAME}?api_key=${API_KEY}`)
    //     .then(res => res.json());

    const accountData = await (await fetch(`${API_ROOT+SUMMONERS_BY_NAME+SUMMONER_NAME}?api_key=${API_KEY}`)).json();
    
    const {
        accountId: SUMMONER_ID_ENCRYPTED
    } = await (await fetch(`${API_ROOT+SUMMONERS_BY_NAME+SUMMONER_NAME}?api_key=${API_KEY}`)).json();

    
    const matchlist = await (await fetch(`${API_ROOT+MATCHLISTS_BY_ACCOUNT+SUMMONER_ID_ENCRYPTED}?api_key=${API_KEY}`)).json();
    
    const matchlist_by_champion = await (await fetch(`${API_ROOT+MATCHLISTS_BY_ACCOUNT+SUMMONER_ID_ENCRYPTED}?champion=${championId}&api_key=${API_KEY}`)).json();
    // console.log(matchlist);
    console.log("match length: ", matchlist.matches.length);
    console.log("total games: ", matchlist.totalGames);
    // console.log(matchlist_by_champion);
    console.log("list length: ", matchlist_by_champion.matches.length);
    console.log("total games: ", matchlist_by_champion.totalGames);

    console.log(SUMMONER_ID_ENCRYPTED);

    res.render("home");
};