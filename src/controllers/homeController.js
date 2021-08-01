import fetch from "node-fetch";

const API_KEY = "RGAPI-5ac00e0d-d5b2-4898-a3c9-eaecf3f95ddf";
const API_ROOT = "https://kr.api.riotgames.com/";
const SUMMONERS_BY_NAME = "lol/summoner/v4/summoners/by-name/";
const MATCHLISTS_BY_ACCOUNT = "lol/match/v4/matchlists/by-account/";
const SUMMONER_NAME = "summit road";
let SUMMONER_ID_ENCRYPTED = ""; 

export const home = async (req, res) => {
    // const accountData = await fetch(`${API_ROOT+SUMMONERS_BY_NAME+SUMMONER_NAME}?api_key=${API_KEY}`)
    //     .then(res => res.json());

    const accountData = await (await fetch(`${API_ROOT+SUMMONERS_BY_NAME+SUMMONER_NAME}?api_key=${API_KEY}`)).json();
    
    const {
        accountId: SUMMONER_ID_ENCRYPTED
    } = await (await fetch(`${API_ROOT+SUMMONERS_BY_NAME+SUMMONER_NAME}?api_key=${API_KEY}`)).json();

    const matchlist = await (await fetch(`${API_ROOT+MATCHLISTS_BY_ACCOUNT+SUMMONER_ID_ENCRYPTED}?api_key=${API_KEY}`)).json();

    console.log(matchlist);

    console.log(matchlist.matches.length);

    res.render("home");
};